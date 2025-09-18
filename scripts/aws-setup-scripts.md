
# AWS EKS 部署 cook_assistant 全流程脚本与步骤

## 1. 本地环境准备

### 1.1 安装 Homebrew（如未安装）
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.2 安装 AWS CLI、kubectl、eksctl
```sh
brew install awscli
brew install kubectl
brew install eksctl
```

### 1.3 配置 AWS CLI 认证
```sh
aws configure sso
# 按提示输入 AWS Access Key、Secret Key、region（如 us-west-2）、output（json）
```

---

## 2. 构建并推送 Docker 镜像到 ECR

### 2.1 登录 AWS 控制台，创建 ECR 仓库（如 cook-assistant）

### 2.2 登录 ECR
```sh
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 891376919909.dkr.ecr.us-east-2.amazonaws.com
```

### 2.3 构建并推送镜像
```sh
docker build -t simba/cook-assistant .

docker tag simba/cook-assistant:latest 891376919909.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest

docker push 891376919909.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest
```

---

## 3. 创建 EKS 集群

### 3.1 创建集群
```sh
eksctl create cluster \
--name cook-assistant-cluster \
--region us-east-2 \
--nodegroup-name standard-workers \
--nodes 2 \
--node-type t3.medium \
--managed
```

### 3.2 配置 kubectl 访问集群
```sh
aws eks --region us-east-2 update-kubeconfig --name cook-assistant-cluster
```

---

## 4. 配置环境变量（K8s Secret）

### 4.1 创建 Secret
```sh
kubectl create secret generic cook-assistant-env --from-env-file=.env
```

---

## 5. 编写 K8s 部署与服务配置

### 5.1 新建 k8s/deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cook-assistant
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cook-assistant
  template:
    metadata:
      labels:
        app: cook-assistant
    spec:
      containers:
      - name: cook-assistant
        image: 891376919909.dkr.ecr.us-east-2.amazonaws.com/cook-assistant:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: cook-assistant-env
```

### 5.2 新建 k8s/service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cook-assistant-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: cook-assistant
```

---

## 6. 部署到 EKS

```sh
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## 7. 获取外部访问地址

```sh
kubectl get svc cook-assistant-service
# 等待 EXTERNAL-IP 分配后，通过 http://EXTERNAL-IP 访问
```


#### **第 5 步 (修订): 修改 K8s 服务配置**

首先，我们需要修改您的 `service.yaml`。在生产环境中，我们通常不直接将 Service 暴露为 `LoadBalancer` 类型，而是通过 Ingress 来统一管理入口流量。

**为什么？** `type: LoadBalancer` 会为每个 Service 创建一个昂贵的网络负载均衡器（NLB）。而 Ingress 可以让多个 Service 共享一个应用负载均衡器（ALB），成本更低，功能更强大（如 URL 路径路由）。

**将 `k8s/service.yaml` 修改为：**

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cook-assistant-service
spec:
  # 1. 将类型从 LoadBalancer 改为 ClusterIP
  # 这意味着 Service 只在集群内部可见，外部流量将由 Ingress 统一处理
  type: ClusterIP 
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: cook-assistant
```

-----

### **第 8 步: 通过 Ingress 暴露服务 (生产实践)**

这是将您的应用暴露给外部世界的推荐方式。它需要安装一个 Ingress Controller，在 EKS 上，我们使用 **AWS Load Balancer Controller**。

#### 8.1 安装 AWS Load Balancer Controller

这个控制器会自动监听集群中的 Ingress 资源，并根据其规则创建和管理 AWS Application Load Balancer (ALB)。`eksctl` 提供了最简单的安装方式。

```sh

export AWS_PROFILE=Solution-Architects.User-979559056307

# 1. 为 ALB Controller 创建 IAM OIDC Provider 和 ServiceAccount
# 这个命令允许 Kubernetes ServiceAccount 扮演一个拥有操作 ALB 权限的 IAM 角色，这是最安全的认证方式
eksctl utils associate-iam-oidc-provider --region=us-east-2 --cluster=cook-assistant-cluster --approve

# 2. 安装 AWS Load Balancer Controller
# 我们使用 Helm（Kubernetes 的包管理器）来安装
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=cook-assistant-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

**检查安装是否成功：**

```sh
kubectl get deployment -n kube-system aws-load-balancer-controller
```

当 `READY` 状态为 `2/2` 时，表示安装成功。

#### 8.2 新建 `k8s/ingress.yaml`

这个文件定义了流量从 ALB 路由到我们 `cook-assistant-service` 的规则。

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cook-assistant-ingress
  annotations:
    # 指定使用我们安装的 ALB Ingress Controller
    kubernetes.io/ingress.class: alb
    # 指定 ALB 的模式为面向互联网 (internet-facing)
    alb.ingress.kubernetes.io/scheme: internet-facing
    # 指定目标类型为 ip，这是性能更好的模式
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
    # 暂时不指定 host，允许通过 IP 地址访问
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: cook-assistant-service # 路由到我们的 Service
                port:
                  number: 80 # 对应 Service 的端口
```

#### 8.3 部署 Service 和 Ingress

现在我们应用新的 `service.yaml` 和 `ingress.yaml`。

```sh
# 应用修改后的 Service
kubectl apply -f k8s/service.yaml

# 应用新的 Ingress
kubectl apply -f k8s/ingress.yaml
```

#### 8.4 获取新的外部访问地址

```sh
# 获取 Ingress 的状态
kubectl get ingress cook-assistant-ingress
```

**等待几分钟**，直到 `ADDRESS` 列出现一个长长的 DNS 地址。这个地址就是 ALB 的公网地址。通过 `http://<ALB-DNS-ADDRESS>` 访问您的应用。

-----

### **第 9 步: 配置 HTTPS 与自定义域名 (生产必备)**

生产应用必须使用 HTTPS。我们将使用 AWS Certificate Manager (ACM) 来免费签发 SSL 证书，并将其绑定到我们的 ALB 上。

1.  **获取 SSL 证书**:

      * 前往 AWS 控制台的 **Certificate Manager (ACM)** 服务。
      * 确保区域是 `us-east-2`。
      * 点击“请求证书”，选择“请求公有证书”。
      * 输入您的域名，例如 `app.yourdomain.com`。建议同时添加一个通配符域名 `*.yourdomain.com`。
      * 选择 **DNS 验证**（推荐），并按指引在您的域名提供商（如 Route 53）处添加 CNAME 记录。
      * 等待证书状态变为“**已颁发 (Issued)**”。
      * 记录下这个证书的 **ARN** (Amazon Resource Name)。

2.  **更新 `ingress.yaml`**

    ```yaml
    # k8s/ingress.yaml (更新后)
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: cook-assistant-ingress
      annotations:
        kubernetes.io/ingress.class: alb
        alb.ingress.kubernetes.io/scheme: internet-facing
        alb.ingress.kubernetes.io/target-type: ip
        # --- 新增注解 ---
        # 1. 关联你的 ACM 证书 ARN
        alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-2:891376919909:certificate/your-cert-id
        # 2. 强制将所有 HTTP 流量重定向到 HTTPS
        alb.ingress.kubernetes.io/ssl-redirect: '443'
    spec:
      rules:
        # 3. 指定你的域名
        - host: app.yourdomain.com 
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: cook-assistant-service
                    port:
                      number: 80
    ```

3.  **应用更新并配置 DNS**:

      * `kubectl apply -f k8s/ingress.yaml`
      * 前往 AWS **Route 53** (或您的 DNS 提供商)。
      * 创建一个 `A` 记录，将您的域名 (`app.yourdomain.com`) 指向 ALB 的地址。选择“**别名(Alias)**”记录类型，目标选择“**区域中应用程序和经典负载均衡器的别名**”，然后从下拉列表中选择您的 ALB。

现在，您可以通过 `https://app.yourdomain.com` 访问您的应用了！

-----

### **第 10 步: 监控与日志 (可观测性)**

1.  **日志**: 使用 `kubectl logs <pod-name>` 查看日志只适合临时调试。生产环境中，需要集中管理日志。
      * **启用 CloudWatch Container Insights**:
        ```sh
        # 为 EKS 集群开启所有类型的日志记录，日志会自动发送到 CloudWatch
        eksctl utils update-cluster-logging --enable-types=all --region=us-east-2 --cluster=cook-assistant-cluster --approve
        ```
2.  **监控**: Container Insights 同时提供了强大的监控功能。
      * 前往 AWS **CloudWatch** 控制台，在左侧导航栏找到“**容器洞察 (Container Insights)**”。在这里你可以看到集群、节点、Pod 的 CPU、内存、网络等性能图表和告警。

-----

### **第 11 步: 资源管理与自动伸缩**

#### 11.1 配置资源请求与限制

在 `k8s/deployment.yaml` 中为容器添加资源声明，这能保证 Pod 的服务质量 (QoS)，防止某个 Pod 耗尽节点资源。

```yaml
# k8s/deployment.yaml (片段)
...
    spec:
      containers:
      - name: cook-assistant
        image: 891376919909.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: cook-assistant-env
        # --- 新增资源声明 ---
        resources:
          requests: # 保证 Pod 至少获得的资源
            memory: "256Mi"
            cpu: "100m" # 0.1 核 CPU
          limits: # Pod 最多能使用的资源
            memory: "512Mi"
            cpu: "500m" # 0.5 核 CPU
```

`kubectl apply -f k8s/deployment.yaml` 应用更改。

#### 11.2 配置水平 Pod 自动伸缩 (HPA)

当 CPU 使用率升高时，自动增加 Pod 数量来应对流量高峰。

1.  **安装 Metrics Server**: HPA 需要从 Metrics Server 获取 Pod 的资源使用数据。EKS 默认会安装。可通过 `kubectl get pods -n kube-system | grep metrics-server` 确认。

2.  **新建 `k8s/hpa.yaml`**:

    ```yaml
    apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: cook-assistant-hpa
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: cook-assistant # 目标是我们的 Deployment
      minReplicas: 2 # 最小副本数
      maxReplicas: 5 # 最大副本数
      metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 80 # 当 CPU 平均使用率超过 80% 时扩容
    ```

3.  `kubectl apply -f k8s/hpa.yaml` 部署 HPA。

-----

### **第 12 步: 自动化部署 (CI/CD)**

手动运行 `docker build/push` 和 `kubectl apply` 既繁琐又容易出错。生产环境应使用 CI/CD 流水线自动化此过程。**GitHub Actions** 是一个绝佳的选择。

在您的项目根目录下创建 `.github/workflows/deploy.yml`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to EKS

on:
  push:
    branches:
      - main # 当代码推送到 main 分支时触发

env:
  AWS_REGION: us-east-2
  ECR_REPOSITORY: simba/cook-assistant
  EKS_CLUSTER_NAME: cook-assistant-cluster

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"

    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

    - name: Deploy to EKS
      run: |
        # 使用 kubectl set image 命令来触发滚动更新，而不是 apply
        # 这是因为 apply 不会更新镜像的 tag，除非文件名也变了
        kubectl set image deployment/cook-assistant cook-assistant=${{ steps.build-image.outputs.image }}
```

**配置**: 您需要在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 中配置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`。

至此，您的部署流程已经非常接近生产环境的最佳实践了。



