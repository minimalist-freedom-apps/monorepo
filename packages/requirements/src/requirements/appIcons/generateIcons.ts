import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND_COLOR } from '@minimalist-apps/components';
import { createCanvas } from '@napi-rs/canvas';

// --- Types ---

export interface GenerateIconsConfig {
    readonly emoji: string;
    readonly webOutputDir: string;
    readonly androidResDir?: string | undefined;
}

// --- Constants ---

const EMOJI_FONT_FAMILY =
    '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Twemoji Mozilla", sans-serif';

const EMOJI_PADDING_RATIO = 0.15;

const WEB_SIZES = [192, 512] as const;
const FAVICON_SIZE = 48;

const ANDROID_DENSITIES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'] as const;
type AndroidDensity = (typeof ANDROID_DENSITIES)[number];

const ANDROID_LAUNCHER_SIZE: Record<AndroidDensity, number> = {
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
};

const ANDROID_FOREGROUND_SIZE: Record<AndroidDensity, number> = {
    mdpi: 108,
    hdpi: 162,
    xhdpi: 216,
    xxhdpi: 324,
    xxxhdpi: 432,
};

// --- Helpers ---

const renderOnBackground = ({
    emoji,
    size,
}: {
    readonly emoji: string;
    readonly size: number;
}): Buffer => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BRAND_COLOR;
    ctx.fillRect(0, 0, size, size);

    const fontSize = Math.floor(size * (1 - 2 * EMOJI_PADDING_RATIO));
    ctx.font = `${fontSize}px ${EMOJI_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2);

    return canvas.toBuffer('image/png');
};

const renderOnTransparent = ({
    emoji,
    canvasSize,
    emojiSize,
}: {
    readonly emoji: string;
    readonly canvasSize: number;
    readonly emojiSize: number;
}): Buffer => {
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    const fontSize = Math.floor(emojiSize * (1 - 2 * EMOJI_PADDING_RATIO));
    ctx.font = `${fontSize}px ${EMOJI_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, canvasSize / 2, canvasSize / 2);

    return canvas.toBuffer('image/png');
};

const writeIcon = async ({
    buffer,
    dir,
    filename,
}: {
    readonly buffer: Buffer;
    readonly dir: string;
    readonly filename: string;
}): Promise<void> => {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
};

// --- Web icons ---

const generateWebIcons = async ({
    emoji,
    outputDir,
}: {
    readonly emoji: string;
    readonly outputDir: string;
}): Promise<void> => {
    const favicon = renderOnBackground({
        emoji,
        size: FAVICON_SIZE,
    });
    await writeIcon({
        buffer: favicon,
        dir: outputDir,
        filename: 'favicon.png',
    });

    for (const size of WEB_SIZES) {
        const buffer = renderOnBackground({ emoji, size });
        await writeIcon({
            buffer,
            dir: outputDir,
            filename: `icon-${size}x${size}.png`,
        });
    }
};

// --- Android icons ---

const generateAndroidIcons = async ({
    emoji,
    resDir,
}: {
    readonly emoji: string;
    readonly resDir: string;
}): Promise<void> => {
    for (const density of ANDROID_DENSITIES) {
        const launcherSize = ANDROID_LAUNCHER_SIZE[density];
        const foregroundSize = ANDROID_FOREGROUND_SIZE[density];
        const dir = join(resDir, `mipmap-${density}`);

        const launcher = renderOnBackground({
            emoji,
            size: launcherSize,
        });
        await writeIcon({ buffer: launcher, dir, filename: 'ic_launcher.png' });
        await writeIcon({
            buffer: launcher,
            dir,
            filename: 'ic_launcher_round.png',
        });

        const foreground = renderOnTransparent({
            emoji,
            canvasSize: foregroundSize,
            emojiSize: launcherSize,
        });
        await writeIcon({
            buffer: foreground,
            dir,
            filename: 'ic_launcher_foreground.png',
        });
    }

    const bgXml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<resources>',
        `    <color name="ic_launcher_background">${BRAND_COLOR}</color>`,
        '</resources>',
        '',
    ].join('\n');

    await writeFile(join(resDir, 'values', 'ic_launcher_background.xml'), bgXml);
};

// --- Public API ---

export const generateIcons = async ({
    emoji,
    webOutputDir,
    androidResDir,
}: GenerateIconsConfig): Promise<void> => {
    console.log(`Generating icons for emoji: ${emoji}`);

    await generateWebIcons({ emoji, outputDir: webOutputDir });
    console.log(`  ✓ Web icons → ${webOutputDir}`);

    if (androidResDir !== undefined) {
        await generateAndroidIcons({
            emoji,
            resDir: androidResDir,
        });
        console.log(`  ✓ Android icons → ${androidResDir}`);
    }

    console.log('Done!');
};
