
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
aws configure
# 按提示输入 AWS Access Key、Secret Key、region（如 us-west-2）、output（json）
```

---

## 2. 构建并推送 Docker 镜像到 ECR

### 2.1 登录 AWS 控制台，创建 ECR 仓库（如 cook-assistant）

### 2.2 登录 ECR
```sh
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 979559056307.dkr.ecr.us-east-2.amazonaws.com
```

### 2.3 构建并推送镜像
```sh
docker build -t simba/cook-assistant .

docker tag simba/cook-assistant:latest 979559056307.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest

docker push 979559056307.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest
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
aws eks --region <region> update-kubeconfig --name cook-assistant-cluster
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
        image: 979559056307.dkr.ecr.us-east-2.amazonaws.com/simba/cook-assistant:latest
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

---

## 8. 代理与 API 访问（如需）

- 推荐 EKS 集群和节点选择境外区域（如 us-west-2），避免 Google API 地域限制。
- 如需在代码层配置代理，可用 https-proxy-agent 等库，并将代理服务器地址写入环境变量。

---