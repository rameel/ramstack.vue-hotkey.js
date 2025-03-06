# Vue-Hotkey

`@ramstack/vue-hotkey` is a lightweight package that simplifies the handling of keyboard shortcuts within Vue applications.

Uses [@ramstack/hotkey](https://github.com/rameel/hotkey) under the hood.

## Installation

### Using via NPM
```sh
npm install --save @ramstack/vue-hotkey
```

### Using via CDN
```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ramstack/vue-hotkey@1/dist/vue-hotkey.min.js"></script>

<script>
    const app = Vue.createApp({
        setup() {
            //
        }
    });

    // Register the hotkey plugin
    app.use(HotkeyPlugin);

    app.mount("#app");
</script>
```

### Using the ES module build
```html
<script type="module">
    import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
    import { HotkeyPlugin } from "https://cdn.jsdelivr.net/npm/@ramstack/vue-hotkey@1/dist/vue-hotkey.esm.min.js";

    const app = createApp({
        setup() {
            //
        }
    });

    // Register the hotkey plugin
    app.use(HotkeyPlugin);

    app.mount("#app");
</script>
```

## Quick start

Specify the hotkey using directive modifiers.
```vue
<script setup>
  import { vHotkey } from "@ramstack/vue-hotkey";
</script>

<template>
  <div v-hotkey.ctrl+k.window.prevent="() => { console.log('Search...') }"></div>
</template>
```
The hotkey is case-insensitive. Standard key names are used.
You can find them here [Key values for keyboard events](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)

In addition, there are also aliases for some key names:

```js
const aliases: Record<string, string> = {
    "esc"         : "escape",
    "ins"         : "insert",
    "del"         : "delete",
    "up"          : "arrowup",
    "down"        : "arrowdown",
    "right"       : "arrowright",
    "left"        : "arrowleft",
    "pgup"        : "pageup",
    "pgdn"        : "pagedown",
    "break"       : "pause",
    "scroll"      : "scrolllock",
    "scrlk"       : "scrolllock",
    "prtscr"      : "printscreen",
    "win"         : "meta",
    "windows"     : "meta",
    "cmd"         : "meta",
    "command"     : "meta",
    "comma"       : ",",
    "period"      : ".",
    "quote"       : "\"",
    "singlequote" : "'",
    "colon"       : ":",
    "semicolon"   : ";",
    "plus"        : "+",
    "minus"       : "-",
    "tilde"       : "~",
    "equal"       : "=",
    "slash"       : "/"
};
```

### Event modifiers
To simplify the need to call `event.preventDefault()` or `event.stopPropagation()` inside event handlers,
the `vHotkey` directive provides appropriate event modifiers.
* `.stop`
* `.prevent`
* `.passive`
* `.capture`
* `.once`
* `.trusted`

```vue
<!-- prevent the default behavior for the keyboard event -->
<div v-hotkey.prevent.ctrl+s="event => save(event)"></div>

<!-- the event's propagation will be stopped -->
<div v-hotkey.stop.ctrl+s="event => save(event)"></div>

<!-- modifiers can be chained -->
<div v-hotkey.ctrl+s.prevent.stop.trusted="event => save(event)"></div>
```

### Alternative hotkeys
You can define multiple hotkeys for a single action if you need to. In the example, a single action is triggered
for both `Ctrl + S` and `Shift + S`. To determine which of hotkeys triggered the event, access the `hotkey` property,
which contains the string representation of the hotkey.
```vue
<div v-hotkey.ctrl+s.shift+s.prevent.stop="event => console.log(event.hotkey)"></div>
```

### Global listening for events
Use the `window` or `document` modifiers to listen for events globally at the page level.

```vue
<div v-hotkey.ctrl+s.window.prevent="event => save(event)"></div>
```

### Event name to listen for
To specify the event name to be listened for, use the argument directive.
The default event is `keydown`.
```vue
<div v-hotkey:keyup.ctrl+k="() => { console.log('Search...') }"></div>
```

### Exclude elements from hotkey handling
If you wish to prevent hotkey handling on certain elements, add the `data-hotkey-ignore` attribute to the respective element.
```html
<div id="app" v-hotkey.shift+k="...">
    ...
    <!-- Ignoring hotkeys on the input element -->
    <input type="text" data-hotkey-ignore>
</div>
```

Alternatively, apply it to the parent if you want to exclude an entire group of elements at once.
```html
<div id="app" v-hotkey.shift+k="...">
    ...
    <!-- Ignoring hotkeys on form elements -->
    <form data-hotkey-ignore>
        ...
    </form>
</div>
```

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.vue-hotkey.js/blob/main/LICENSE) file for more details.
