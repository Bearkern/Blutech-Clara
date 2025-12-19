# 電表階層管理系統

此專案可執行電表階層管理系統操作。

## 安裝與啟動

```bash
npm install
npm run dev
#服務在 http://localhost:5173/
```

## 操作說明

#### 選取設備，點選移動階層按鈕，選取父電表可移動至該父電表之下。

> ![image](https://firebasestorage.googleapis.com/v0/b/user-manual-90e9e.firebasestorage.app/o/move.gif?alt=media&token=ab81b7be-0509-4573-9ba2-bad01a8d3cfa)

#### 按住 alt, meta key 或 ctrl 可多選，但不可跨階層選取。

> ![image](https://firebasestorage.googleapis.com/v0/b/user-manual-90e9e.firebasestorage.app/o/multi-select.gif?alt=media&token=2509156b-0754-47ad-bc46-6c462b0ce52c)

#### 移動限制

1. 不可移動到與原本相同的父層。
2. 不可將電表移動到自身或其子孫節點底下。

   > ![image](https://firebasestorage.googleapis.com/v0/b/user-manual-90e9e.firebasestorage.app/o/move-restrict.gif?alt=media&token=b87e7cec-933f-4cf7-b83b-ae594f44bc50)
