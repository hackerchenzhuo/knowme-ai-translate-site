<p align="center"><img src="assets/repository-cover.svg" alt="KnowMe — lightweight tools, deeper reading" width="100%"></p>

<p align="center"><a href="https://hackerchenzhuo.github.io/knowme-ai-translate-site/">中文官网</a> · <a href="https://hackerchenzhuo.github.io/knowme-ai-translate-site/en/">English website</a> · <a href="help.html">使用指南 / User guide</a></p>

# KnowMe · 知我

**从找论文，到读懂它。** 两款轻量 Chrome 插件，把筛选、阅读和整理连起来。

**From discovery to understanding.** Two lightweight Chrome extensions for everyday research.

| | Paper Radar · 论文雷达 | AI Translate · AI 翻译 |
|---|---|---|
| For | 按研究方向发现论文，按需查看依据 | 读原文、保留结构，沿用个人译法 |
| Workflow | Discover relevant papers and inspect their evidence | Read with structure and domain-specific terms |
| Install & update | [Chrome Web Store ↗](https://chromewebstore.google.com/detail/aneomkhamcijmfmeeegocbknklflilof) | [Chrome Web Store ↗](https://chromewebstore.google.com/detail/ggbnigoglmfkdfmjggiifmfoinncblgm) |
| Privacy | [论文雷达 / Paper Radar](radar-privacy.html) | [AI 翻译 / AI Translate](privacy.html) |

## A closer look

Explore Paper Radar through the original Chrome Web Store screenshots: the **RRSI** score breakdown, institution evidence and annotations on arXiv. Switch to AI Translate for a structured **Markdown** reading note with headings, nested lists, hyperlinks, tables and code. Compare the English source and Chinese translation, inspect the Markdown source and choose your preferred term for *harness*.

The website uses original product screenshots and a clearly marked, prewritten translation example. It does not run paper searches, call a model, read extension data or collect analytics. The translation pane intentionally demonstrates English-to-Chinese reading in both website languages.

<p align="center"><img src="assets/product-tour.gif" alt="Original Paper Radar screenshots and a structured Markdown translation tour" width="100%" loading="lazy"></p>

## Website source

This repository contains the public product website, user guide and privacy pages. Extension application source remains in separate private repositories. Installation and updates go through the original Chrome Web Store listings.

```text
index.html          中文产品官网
en/index.html       English product website
app.js              Interactive product tour
style.css           Shared visual system
docs.js             Document language switch
help.html           AI Translate user guide
privacy.html        AI Translate privacy
radar-privacy.html  Paper Radar privacy
assets/             Public product visuals
```

Buildless HTML, CSS and JavaScript. Preview with any static HTTP server from the repository root. No package installation or API key is needed.

The existing `/help.html`, `/privacy.html` and `/radar-privacy.html` paths remain available for store links and bookmarks.
