## **“孕期饮食助手” Web应用产品需求文档 (PRD)**

**版本:** 1.0
**日期:** 2025年7月3日
**负责人:** (您的名字)

### **1. 产品概述 (Executive Summary)**

#### **1.1. 问题陈述**
怀孕是女性生命中的一个特殊时期，孕期饮食直接关系到母婴的健康。许多准父母（尤其是第一次经历的）对于“孕期该吃什么”、“怎么吃才安全有营养”感到困惑和焦虑。他们需要一个可靠、便捷且个性化的工具，来帮助他们规划和准备每日的孕期餐食，确保营养均衡，并避免摄入有害食物。

#### **1.2. 解决方案**
“孕期饮食助手”是一个专注于孕期健康饮食的Web应用程序。其核心功能是，用户可以每天早晨访问应用，通过简单的交互（如点击“今天吃什么？”按钮），即可获得由AI驱动生成的、符合其孕周、口味偏好和健康状况的个性化三餐（及加餐）菜谱。应用不仅提供菜谱，还附有详细的制作步骤、营养成分分析和孕期饮食安全提示。

#### **1.3. 产品目标**
* **核心目标:** 成为准父母最信赖的孕期饮食顾问，简化每日餐食决策过程。
* **用户目标:**
    * **对于孕妇:** 获得科学、安全、美味的饮食建议，缓解饮食焦虑。
    * **对于伴侣 (开发者本人):** 轻松地为妻子准备每日餐食，用实际行动表达关爱。
* **商业目标 (V1.0):** 验证产品核心价值，获取首批种子用户，收集反馈并迭代优化。

#### **1.4. 目标用户 (Target Audience)**
* **主要用户:** 备孕期及孕期中的女性。
* **次要用户:** 孕妇的伴侣、家人等关心并负责其饮食的成员。

---

### **2. 用户画像 (User Personas)**

#### **2.1. 准妈妈 - 小琳 (30岁，怀孕14周)**
* **背景:** 第一次怀孕，在一家互联网公司做市场工作，生活节奏快。
* **痛点:**
    * 工作繁忙，没有太多时间研究复杂的孕期食谱。
    * 信息过载，网上关于孕期饮食的说法众说纷纭，不知道该信谁。
    * 有轻微的孕吐反应，对某些气味和食物感到反感。
    * 担心宝宝营养不够，也怕自己体重增长过快。
* **需求:**
    * 希望有一个权威可靠的信源。
    * 需要快速、简单、操作性强的每日食谱。
    * 食谱能考虑到她的孕周和口味变化。

#### **2.2. 准爸爸 - 阿杰 (32岁，小琳的丈夫，IT工程师)**
* **背景:** 本次应用的发起者，关心妻子，希望能在饮食上为她提供最好的支持。
* **痛点:**
    * 虽然想为妻子做好吃的，但厨艺一般，且不了解孕期营养学知识。
    * 害怕自己选的食材或做法对妻子和宝宝不好。
    * 每天想“今天该做什么菜”是一件头疼的事。
* **需求:**
    * 需要“傻瓜式”的菜谱，包含清晰的用料和步骤。
    * 希望应用能直接告诉他“今天买这些菜，照着这么做就行”。
    * 能快速查询某种食物孕妇是否能吃。

---

### **3. 功能规格 (Features & Requirements)**

#### **3.1. [P0] 核心功能：AI每日菜谱推荐**

* **用户故事:** 作为一个用户，我希望每天都能在首页看到一个“今天吃什么？”的按钮，点击后，系统能根据我的个人情况（孕周、忌口等）为我推荐一套完整的一日三餐（外加1-2次加餐）的菜谱。
* **功能需求:**
    1.  **交互界面:**
        * 首页需有一个醒目、易于点击的按钮，文案为“获取今日食谱”或类似。
        * 点击后，页面以卡片或列表形式清晰展示推荐的早餐、午餐、晚餐、上午加餐、下午加餐的菜名。
    2.  **AI推荐逻辑 (后端核心):**
        * **输入参数:** 用户设置的孕周、过敏原、不喜欢的食物、特殊健康状况（如妊娠期糖尿病、贫血等）。
        * **营养算法:** AI模型需结合《中国居民膳食指南》孕期妇女部分，确保推荐的食谱组合满足对应孕周的能量、蛋白质、叶酸、铁、钙等关键营养素需求。
        * **安全过滤:** AI模型必须内置一个孕期禁忌/慎食食物数据库（如生肉、部分海鲜、含酒精食物等），绝不推荐此类食物。
        * **多样性与人性化:**
            * 避免连续多日推荐重复菜品。
            * 考虑烹饪的难易度和耗时，以家常菜为主。
            * 允许用户对推荐结果进行“换一换”操作。

#### **3.2. [P0] 功能：菜谱详情与做法**

* **用户故事:** 当我看到推荐的菜谱后，我希望能点击任意一个菜名，查看它的详细做法、所需食材和营养信息，这样我才能照着做。
* **功能需求:**
    1.  **内容展示:**
        * **菜品图片:** 成品展示图，增加食欲。
        * **所需食材:** 清单形式，包含具体用量（如：牛肉 150克）。
        * **烹饪步骤:** 步骤编号，图文并茂为佳，描述清晰简洁。
        * **预估时间:** 准备时间、烹饪时间。
        * **营养分析:** 以图表或列表展示该菜品的主要营养成分（如：卡路里、蛋白质、铁、钙等）及其对孕妇的益处。
        * **温馨提示:** 针对该菜品的孕期饮食小贴士（如：菠菜和豆腐同食会影响钙吸收，建议焯水等）。

#### **3.3. [P0] 功能：用户个人档案设置**

* **用户故事:** 作为一个新用户，我希望能设置我的个人信息，如孕周、过敏的食物和不爱吃的东西，这样应用才能给我更精准的推荐。
* **功能需求:**
    1.  **首次引导 (Onboarding):**
        * 新用户首次访问时，应有引导流程，收集关键信息。
        * **输入项1 (必填):** 预产期或当前孕周。系统根据此信息自动计算孕期阶段（早期、中期、晚期）。
        * **输入项2 (可选):** 饮食禁忌。通过标签选择或文本输入，记录过敏原（如花生、海鲜）和不爱吃的食物（如香菜、肥肉）。
        * **输入项3 (可选):** 健康状况。提供标签勾选，如“妊娠期糖尿病”、“贫血”、“高血压”等，以便AI调整食谱（如控制糖分、推荐高铁食物）。
    2.  **个人中心:**
        * 用户可以随时在“我的”或“设置”页面修改以上信息。

#### **3.4. [P1] 功能：孕期饮食知识库**

* **用户故事:** 当我不确定某种水果或零食能不能吃时，我希望能有一个搜索功能，快速查询到权威的答案。
* **功能需求:**
    1.  **搜索功能:** 在应用内提供一个搜索框。
    2.  **食物数据库:**
        * 建立一个食物安全数据库，包含常见食材、水果、零食、饮品等。
        * 每种食物有明确的标签：**【放心吃】**、**【适量吃】**、**【要慎吃】**、**【不能吃】**。
        * 点击食物名称可查看详细解释和原因。

#### **3.5. [P1] 功能：周计划与购物清单**

* **用户故事:** 我希望不仅能看一天的食谱，还能提前规划好一周的饮食，并一键生成购物清单，方便周末集中采购。
* **功能需求:**
    1.  **周视图:** 提供一个日历或列表视图，展示未来一周的每日推荐食谱。
    2.  **食谱调整:** 用户可以对周计划中的任意一餐进行“换一换”操作。
    3.  **购物清单生成:**
        * 用户选定时间范围（如本周）后，点击“生成购物清单”按钮。
        * 系统自动汇总所有菜谱的食材，并合并同类项（如：周一的牛肉150g + 周三的牛肉200g = 牛肉 350g）。
        * 清单可以按食材类别（蔬菜、肉类、主食）分类。
        * 清单支持勾选和分享功能。

---

### **4. 非功能性需求 (Non-Functional Requirements)**

* **性能:** 页面加载速度应在3秒以内，AI推荐响应迅速。
* **UI/UX:** 界面设计温馨、简洁、友好，字体清晰，操作直观，符合孕妇用户群体的审美和使用习惯。
* **兼容性:** 优先适配移动端浏览器（响应式设计），同时兼容主流桌面浏览器（Chrome, Safari, Firefox）。
* **安全性:** 妥善保管用户个人健康数据，进行加密处理。
* **可靠性:** 确保饮食建议的科学性和权威性，数据来源需有据可查。AI模型引用的知识库需要定期更新。

---

### **5. 产品路线图 (Roadmap)**

#### **V1.0 (MVP - 最小可行产品)**
* **核心循环:** 完成用户档案设置 -> AI每日菜谱推荐 -> 查看菜谱详情的核心功能。
* **目标:** 跑通产品逻辑，验证核心价值。

#### **V1.1**
* **完善功能:** 上线[P1]孕期饮食知识库功能。
* **优化体验:** 根据V1.0的用户反馈，优化AI推荐算法和UI交互。

#### **V1.2**
* **扩展功能:** 上线[P1]周计划与购物清单功能。
* **用户粘性:** 增加收藏菜谱功能。

#### **V2.0 (未来规划)**
* **社区功能:** 增加用户交流板块，准妈妈们可以分享自己的食谱和心得。
* **功能扩展:**
    * 增加“伴侣模式”，伴侣可以登录并查看推荐给妻子的食谱和购物清单。
    * 扩展到“备孕期”和“产后/哺乳期”的饮食推荐。
    * 考虑与生鲜电商API打通，实现一键购买购物清单中的食材。
* **多端发展:** 开发原生移动App（iOS/Android）。

---

### **6. 成功指标 (Success Metrics)**

* **用户留存率:** 次日留存率、周留存率。这是衡量产品是否有价值的关键。
* **核心功能使用率:** 每日生成“今日食谱”的用户比例。
* **用户满意度:** 通过NPS（净推荐值）问卷或简单的评分反馈来衡量。
* **任务成功率:** 用户从看到推荐到查看菜谱详情的转化率。
