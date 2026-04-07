import process from "node:process";
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto(`file://${process.cwd()}/tests/assets/index.html`);
});

async function mount(page, template, data = {}) {
    await page.evaluate(
        state => window.__hotkeyTest.mount(state),
        { template, data }
    );
}

test("should trigger when Ctrl+K is pressed on element", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should trigger when Shift+K is pressed on element", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.shift+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Shift+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should trigger when Ctrl+Alt+Shift+K is pressed", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+alt+shift+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+Alt+Shift+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should not trigger when additional modifier keys are pressed", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.alt+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Alt+Shift+K");

    await expect(page.locator("#count")).toHaveText("0");
});

test("should not trigger on non-matching keys", async ({ page }) => {
    await mount(page, `
        <div>
            <div v-hotkey.window.ctrl+k="() => count++"></div>
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.keyboard.press("Control+J");
    await page.keyboard.press("Control+Shift+K");
    await page.keyboard.press("K");

    await expect(page.locator("#count")).toHaveText("0");
});

test("should trigger on window when .window modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="other" type="text">
            <div v-hotkey.window.ctrl+k="() => count++"></div>
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#other").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should trigger on document when .document modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="other" type="text">
            <div v-hotkey.document.ctrl+k="() => count++"></div>
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#other").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should trigger only once when .once modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k.once="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("1");
});

test("should trigger multiple times without .once modifier", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("2");
});

test("should trigger on keydown by default", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="e => type = e.type">
            <span id="type">{{ type }}</span>
        </div>`,
        { type: "" }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#type")).toHaveText("keydown");
});

test("should trigger on keyup when arg is 'keyup'", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey:keyup.ctrl+k="e => type = e.type">
            <span id="type">{{ type }}</span>
        </div>`,
        { type: "" }
    );

    await page.locator("#text").focus();
    await page.keyboard.down("Control");
    await page.keyboard.down("K");

    await expect(page.locator("#type")).toHaveText("");

    await page.keyboard.up("K");

    await expect(page.locator("#type")).toHaveText("keyup");
});

test("should register multiple hotkeys from multiple modifiers", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+s.shift+s="e => hotkey = e.hotkey">
            <span id="hotkey">{{ hotkey }}</span>
        </div>`,
        { hotkey: "" }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+S");
    await expect(page.locator("#hotkey")).toHaveText("ctrl+s");

    await page.keyboard.press("Shift+S");
    await expect(page.locator("#hotkey")).toHaveText("shift+s");
});

test("should set hotkey property on the event", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="e => hotkey = e.hotkey">
            <span id="hotkey">{{ hotkey }}</span>
        </div>`,
        { hotkey: "" }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#hotkey")).toHaveText("ctrl+k");
});

test("should call preventDefault when .prevent modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k.prevent="e => prevented = e.defaultPrevented">
            <span id="prevented">{{ prevented }}</span>
        </div>`,
        { prevented: false }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#prevented")).toHaveText("true");
});

test("should not call preventDefault without .prevent modifier", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="e => prevented = e.defaultPrevented">
            <span id="prevented">{{ prevented }}</span>
        </div>`,
        { prevented: false }
    );

    await page.locator("#text").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#prevented")).toHaveText("false");
});

test("should call stopPropagation when .stop modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <div @keydown="($event.ctrlKey && $event.key.toLowerCase() === 'k') && outer++">
                <button id="btn" tabindex="0" v-hotkey.ctrl+k.stop="() => inner++"></button>
            </div>
            <span id="outer">{{ outer }}</span>
            <span id="inner">{{ inner }}</span>
        </div>`,
        {
            outer: 0,
            inner: 0
        }
    );

    await page.locator("#btn").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#inner")).toHaveText("1");
    await expect(page.locator("#outer")).toHaveText("0");
});

test("should propagate event without .stop modifier", async ({ page }) => {
    await mount(page, `
        <div>
            <div @keydown="($event.ctrlKey && $event.key.toLowerCase() === 'k') && outer++">
                <button id="btn" tabindex="0" v-hotkey.ctrl+k="() => inner++"></button>
            </div>
            <span id="outer">{{ outer }}</span>
            <span id="inner">{{ inner }}</span>
        </div>`,
        {
            outer: 0,
            inner: 0
        }
    );

    await page.locator("#btn").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#inner")).toHaveText("1");
    await expect(page.locator("#outer")).toHaveText("1");
});

test("should not trigger on untrusted events when .trusted modifier is set", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k.trusted="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").evaluate(el => {
        el.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "k",
                code: "KeyK",
                ctrlKey: true,
                bubbles: true
            })
        );
    });

    await expect(page.locator("#count")).toHaveText("0");
});

test("should trigger on untrusted events without .trusted modifier", async ({ page }) => {
    await mount(page, `
        <div>
            <input id="text" v-hotkey.ctrl+k="() => count++">
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#text").evaluate(el => {
        el.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "k",
                code: "KeyK",
                ctrlKey: true,
                bubbles: true
            })
        );
    });

    await expect(page.locator("#count")).toHaveText("1");
});

test("should clean up listener when element is removed", async ({ page }) => {
    await mount(page, `
        <div>
            <div id="target" v-if="visible" v-hotkey.window.ctrl+k="() => count++"></div>
            <button id="remove" @click="visible = false">Remove</button>
            <span id="count">{{ count }}</span>
        </div>`,
        {
            count: 0,
            visible: true
        }
    );

    await page.keyboard.press("Control+K");
    await expect(page.locator("#count")).toHaveText("1");

    const target = page.locator("#target");
    await expect(target).toBeAttached();

    await page.locator("#remove").click();
    await target.waitFor({ state: "detached" });

    await page.keyboard.press("Control+K");
    await expect(page.locator("#count")).toHaveText("1");
});

test("should not trigger on elements with [data-hotkey-ignore]", async ({ page }) => {
    await mount(page, `
        <div v-hotkey.ctrl+k="() => count++">
            <input id="ignored" data-hotkey-ignore>
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#ignored").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("0");
});

test("should not trigger when parent has [data-hotkey-ignore]", async ({ page }) => {
    await mount(page, `
        <div v-hotkey.ctrl+k="() => count++">
            <div data-hotkey-ignore>
                <div>
                    <div>
                        <input id="ignored-via-parent">
                    </div>
                </div>
            </div>
            <span id="count">{{ count }}</span>
        </div>`,
        { count: 0 }
    );

    await page.locator("#ignored-via-parent").focus();
    await page.keyboard.press("Control+K");

    await expect(page.locator("#count")).toHaveText("0");
});

test("should not throw when directive has no handler", async ({ page }) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e));

    await mount(page, `
        <div>
            <div v-hotkey.window.ctrl+k></div>
        </div>
    `);

    await page.keyboard.press("Control+K");

    expect(errors).toHaveLength(0);
});
