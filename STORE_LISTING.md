# Chrome Web Store 上架素材說明

## 套件圖示

已使用專案根目錄的 `Copy UI Icon.png`（512×512）產生 `icons/icon16.png`、`icon48.png`、`icon128.png`，並在 `manifest.json` 的 `icons` / `action.default_icon` 中引用。

## 商店「說明／教學用」截圖

`Sample.png` **不**打包進擴充主程式，僅供你在 [Chrome Web Store 開發者後台](https://chrome.google.com/webstore/devconsole) 上傳：

- **Store listing → Screenshots**（建議 1280×800 或 640×400 等官方要求尺寸；若與現有比例不同，可在上架前用編輯軟體裁切或輸出）
- 或 **Detailed description** 中搭配文字，說明在 Kibana 文件檢視中如何使用複製按鈕

上架 ZIP 請只包含 `manifest.json`、`background.js`、`content_script.js`、`styles.css` 與 `icons/` 目錄，勿將 `Sample.png` 一併打入套件（除非未來程式會讀取該檔）。
