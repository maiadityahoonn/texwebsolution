"use client";

import React, { memo } from "react";
import appleData from "@emoji-mart/data/sets/15/apple.json";

// Build native character to unified hex code mapping
const nativeToUnified = {};

if (appleData?.emojis) {
  for (const emoji of Object.values(appleData.emojis)) {
    if (emoji?.skins) {
      for (const skin of emoji.skins) {
        if (skin.native && skin.unified) {
          nativeToUnified[skin.native] = skin.unified;
          // Support variant without variation selector \uFE0F
          const withoutFe0f = skin.native.replace(/\uFE0F/g, "");
          if (!nativeToUnified[withoutFe0f]) {
            nativeToUnified[withoutFe0f] = skin.unified;
          }
        }
      }
    }
  }
}

// Prepare cached sorted regex for matching emojis inside strings
let emojiRegex = null;
function getEmojiRegex() {
  if (!emojiRegex) {
    const keys = Object.keys(nativeToUnified).sort((a, b) => b.length - a.length);
    const pattern = "(" + keys.map((k) => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|") + ")";
    emojiRegex = new RegExp(pattern, "g");
  }
  return emojiRegex;
}

export function getAppleEmojiUrl(emoji) {
  if (!emoji) return null;
  const unified = nativeToUnified[emoji] || nativeToUnified[emoji.replace(/\uFE0F/g, "")];
  if (!unified) return null;
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${unified}.png`;
}

export function getAppleEmojiImgHtml(emoji, size = 20) {
  const url = getAppleEmojiUrl(emoji);
  if (!url) return emoji;
  const sizePx = typeof size === "number" ? `${size}px` : size;
  return `<img src="${url}" alt="${emoji}" data-emoji="${emoji}" draggable="false" class="apple-emoji-inline inline-block shrink-0 select-none pointer-events-none" style="width: ${sizePx}; height: ${sizePx}; min-width: ${sizePx}; min-height: ${sizePx}; max-width: ${sizePx}; max-height: ${sizePx}; aspect-ratio: 1 / 1; object-fit: contain; vertical-align: -0.22em; margin: 0 1.5px;" />`;
}

export function getPlainTextFromEditor(el) {
  if (!el) return "";
  if (typeof el.value === "string") return el.value;
  let text = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeName === "IMG") {
      text += node.getAttribute("data-emoji") || node.getAttribute("alt") || "";
    } else if (node.nodeName === "BR") {
      text += "\n";
    } else if (node.childNodes && node.childNodes.length > 0) {
      text += getPlainTextFromEditor(node);
    }
  }
  return text;
}

export const AppleEmoji = memo(function AppleEmoji({
  emoji,
  size = 20,
  className = "",
  style = {},
  alt,
}) {
  if (!emoji) return null;
  const url = getAppleEmojiUrl(emoji);
  if (!url) {
    return <span className={className} style={style}>{emoji}</span>;
  }

  const sizePx = typeof size === "number" ? `${size}px` : size;

  return (
    <img
      src={url}
      alt={alt || emoji}
      draggable={false}
      className={`apple-emoji-inline inline-block shrink-0 select-none pointer-events-none ${className}`}
      style={{
        width: sizePx,
        height: sizePx,
        minWidth: sizePx,
        minHeight: sizePx,
        maxWidth: sizePx,
        maxHeight: sizePx,
        aspectRatio: "1 / 1",
        objectFit: "contain",
        flexShrink: 0,
        verticalAlign: "-0.22em",
        ...style,
      }}
      loading="lazy"
    />
  );
});

function renderTextWithEmojis(rawText, emojiSize) {
  if (!rawText) return null;
  const regex = getEmojiRegex();
  regex.lastIndex = 0;

  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIdx) {
      parts.push(rawText.slice(lastIdx, match.index));
    }
    const emojiStr = match[0];
    parts.push(
      <AppleEmoji
        key={`${match.index}-${emojiStr}`}
        emoji={emojiStr}
        size={emojiSize}
      />
    );
    lastIdx = match.index + emojiStr.length;
  }

  if (lastIdx < rawText.length) {
    parts.push(rawText.slice(lastIdx));
  }
  return parts;
}

// WhatsApp Markdown (*bold*, _italic_, ~strike~, `code`, URLs) + Apple Emojis
function parseWhatsAppFormatting(text, emojiSize) {
  if (!text || typeof text !== "string") return text;

  // Match: `code`, *bold*, _italic_, ~strike~, http(s) URLs
  const formatRegex = /(`[^`\n]+`|\*(?:[^*\n]+)\*|_(?:[^_\n]+)_|~(?:[^~\n]+)~|https?:\/\/[^\s<]+)/g;

  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = formatRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      segments.push({ type: "code", content: token.slice(1, -1) });
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      segments.push({ type: "bold", content: token.slice(1, -1) });
    } else if (token.startsWith("_") && token.endsWith("_") && token.length > 2) {
      segments.push({ type: "italic", content: token.slice(1, -1) });
    } else if (token.startsWith("~") && token.endsWith("~") && token.length > 2) {
      segments.push({ type: "strike", content: token.slice(1, -1) });
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      segments.push({ type: "link", content: token });
    } else {
      segments.push({ type: "text", content: token });
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments.map((seg, idx) => {
    if (seg.type === "code") {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[0.88em] bg-black/10 dark:bg-white/15 text-red-700 dark:text-red-300 select-all"
        >
          {renderTextWithEmojis(seg.content, emojiSize)}
        </code>
      );
    }
    if (seg.type === "bold") {
      return (
        <strong key={idx} className="font-bold">
          {renderTextWithEmojis(seg.content, emojiSize)}
        </strong>
      );
    }
    if (seg.type === "italic") {
      return (
        <em key={idx} className="italic">
          {renderTextWithEmojis(seg.content, emojiSize)}
        </em>
      );
    }
    if (seg.type === "strike") {
      return (
        <del key={idx} className="line-through opacity-75">
          {renderTextWithEmojis(seg.content, emojiSize)}
        </del>
      );
    }
    if (seg.type === "link") {
      return (
        <a
          key={idx}
          href={seg.content}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 dark:text-blue-400 hover:underline inline underline-offset-2 break-all"
        >
          {seg.content}
        </a>
      );
    }
    return (
      <React.Fragment key={idx}>
        {renderTextWithEmojis(seg.content, emojiSize)}
      </React.Fragment>
    );
  });
}

export const RenderWithAppleEmojis = memo(function RenderWithAppleEmojis({
  text,
  emojiSize = 18,
  className = "",
}) {
  if (!text) return null;
  if (typeof text !== "string") return text;

  return (
    <span className={className}>
      {parseWhatsAppFormatting(text, emojiSize)}
    </span>
  );
});

export default AppleEmoji;

