import { globalStyle } from "@vanilla-extract/css";
import { normalize } from "./layers.css";

/**
 * CSS Normalize based on modern-normalize v3.0.1
 * https://github.com/sindresorhus/modern-normalize
 * MIT License
 */

/*
Document
========
*/

/**
더 나은 박스 모델 사용 (opinionated).
*/
globalStyle("*, ::before, ::after", {
  "@layer": {
    [normalize]: {
      boxSizing: "border-box",
    },
  },
});

/**
1. 모든 브라우저에서 일관된 기본 폰트 사용
2. 모든 브라우저에서 올바른 line height 설정
3. iOS에서 방향 전환 후 폰트 크기 조정 방지
4. 더 읽기 쉬운 탭 크기 사용 (opinionated)
*/
globalStyle("html", {
  "@layer": {
    [normalize]: {
      fontFamily:
        'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      lineHeight: 1.15,
      WebkitTextSizeAdjust: "100%",
      tabSize: 4,
    },
  },
});

/*
Sections
========
*/

/**
모든 브라우저에서 margin 제거
*/
globalStyle("body", {
  "@layer": {
    [normalize]: {
      margin: 0,
    },
  },
});

/*
Text-level semantics
====================
*/

/**
Chrome과 Safari에서 올바른 폰트 두께 추가
*/
globalStyle("b, strong", {
  "@layer": {
    [normalize]: {
      fontWeight: "bolder",
    },
  },
});

/**
1. 모든 브라우저에서 일관된 기본 폰트 사용
2. 모든 브라우저에서 이상한 'em' 폰트 크기 수정
*/
globalStyle("code, kbd, samp, pre", {
  "@layer": {
    [normalize]: {
      fontFamily:
        'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: "1em",
    },
  },
});

/**
모든 브라우저에서 올바른 폰트 크기 추가
*/
globalStyle("small", {
  "@layer": {
    [normalize]: {
      fontSize: "80%",
    },
  },
});

/**
모든 브라우저에서 'sub'와 'sup' 요소가 line height에 영향을 주지 않도록 방지
*/
globalStyle("sub, sup", {
  "@layer": {
    [normalize]: {
      fontSize: "75%",
      lineHeight: 0,
      position: "relative",
      verticalAlign: "baseline",
    },
  },
});

globalStyle("sub", {
  "@layer": {
    [normalize]: {
      bottom: "-0.25em",
    },
  },
});

globalStyle("sup", {
  "@layer": {
    [normalize]: {
      top: "-0.5em",
    },
  },
});

/*
Tabular data
============
*/

/**
Chrome과 Safari에서 테이블 border 색상 상속 수정
*/
globalStyle("table", {
  "@layer": {
    [normalize]: {
      borderColor: "currentcolor",
    },
  },
});

/*
Forms
=====
*/

/**
1. 모든 브라우저에서 폰트 스타일 변경
2. Firefox와 Safari에서 margin 제거
*/
globalStyle("button, input, optgroup, select, textarea", {
  "@layer": {
    [normalize]: {
      fontFamily: "inherit",
      fontSize: "100%",
      lineHeight: 1.15,
      margin: 0,
    },
  },
});

/**
iOS와 Safari에서 클릭 가능한 타입 스타일 수정
*/
globalStyle('button, [type="button"], [type="reset"], [type="submit"]', {
  "@layer": {
    [normalize]: {
      WebkitAppearance: "button",
    },
  },
});

/**
모든 브라우저에서 개발자가 'fieldset' 요소의 값을 0으로 설정할 때 혼란을 겪지 않도록 padding 제거
*/
globalStyle("legend", {
  "@layer": {
    [normalize]: {
      padding: 0,
    },
  },
});

/**
Chrome과 Firefox에서 올바른 수직 정렬 추가
*/
globalStyle("progress", {
  "@layer": {
    [normalize]: {
      verticalAlign: "baseline",
    },
  },
});

/**
Safari에서 증가/감소 버튼의 커서 스타일 수정
*/
globalStyle("::-webkit-inner-spin-button, ::-webkit-outer-spin-button", {
  "@layer": {
    [normalize]: {
      height: "auto",
    },
  },
});

/**
1. Chrome과 Safari에서 이상한 외관 수정
2. Safari에서 outline 스타일 수정
*/
globalStyle('[type="search"]', {
  "@layer": {
    [normalize]: {
      WebkitAppearance: "textfield",
      outlineOffset: "-2px",
    },
  },
});

/**
macOS의 Chrome과 Safari에서 내부 padding 제거
*/
globalStyle("::-webkit-search-decoration", {
  "@layer": {
    [normalize]: {
      WebkitAppearance: "none",
    },
  },
});

/**
1. iOS와 Safari에서 클릭 가능한 타입 스타일 수정
2. Safari에서 폰트 속성을 'inherit'으로 변경
*/
globalStyle("::-webkit-file-upload-button", {
  "@layer": {
    [normalize]: {
      WebkitAppearance: "button",
      font: "inherit",
    },
  },
});

/*
Interactive
===========
*/

/**
Chrome과 Safari에서 올바른 display 추가
*/
globalStyle("summary", {
  "@layer": {
    [normalize]: {
      display: "list-item",
    },
  },
});
