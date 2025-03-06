import { ObjectDirective, ObjectPlugin } from "vue";
import { registerHotkey } from "@ramstack/hotkey";

const optionKeys = ["stop", "passive", "prevent", "once", "capture", "trusted", "window", "document"];

/**
 * Represents an event triggered by a hotkey.
 * Extends the standard {@link KeyboardEvent} to include additional {@link hotkey} property.
 */
export interface HotkeyEvent extends KeyboardEvent {
    /**
     * Gets the hotkey that triggered this event.
     */
    readonly hotkey: string;
}

export const vHotkey: ObjectDirective<HTMLElement, (e: HotkeyEvent) => void> = {
    mounted(el, { arg, modifiers, value }) {
        const {
            stop,
            passive,
            prevent,
            once,
            capture,
            trusted
        } = modifiers;

        const target = modifiers.window   ? window :
                       modifiers.document ? document : el;

        el[createKey(modifiers)] = Object.keys(modifiers)
            .filter(k => !optionKeys.includes(k))
            .map(hotkey => registerHotkey(
                target,
                hotkey,
                function(e) {
                    stop && e.stopPropagation();
                    prevent && e.preventDefault();
                    e["hotkey"] = hotkey;
                    value?.call(this, e);
                },
                arg ?? "keydown",
                {
                    capture,
                    passive,
                    once,
                    trusted
                }));
    },

    unmounted(el, binding) {
        const key = createKey(binding.modifiers);
        const disposes = el[key] as (() => void)[];
        disposes?.forEach(r => r());
        el[key] = null;
    }
}

export const HotkeyPlugin : ObjectPlugin = {
    install(app) {
        app.directive("hotkey", vHotkey);
    },
};

export {
    registerHotkey
}

function createKey(modifiers: Record<string, boolean>): string {
    return `__hotkey[${ Object.keys(modifiers).join("+") }]`;
}
