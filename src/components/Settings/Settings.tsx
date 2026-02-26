import React from 'react';
import './_Settings.scss';

// ─────────────────────────────────────────────
// Setting definition types
// ─────────────────────────────────────────────

type SettingType = 'number' | 'select' | 'toggle' | 'font';

interface SelectOption {
    label: string;
    value: string | number | boolean;
}

interface SettingDefinition<T = string | number | boolean> {
    /** Unique key for this setting */
    key: string;
    /** Human-readable label shown in the UI */
    displayName: string;
    /** Corresponding Monaco editor option property */
    monacoProperty: string;
    /** Short description shown below the label */
    description?: string;
    /** Input type */
    type: SettingType;
    /** Current value (managed by useState in parent) */
    value: T;
    /** Options for 'select' type */
    options?: SelectOption[];
    /** Min/max for 'number' type */
    min?: number;
    max?: number;
    step?: number;
}

// ─────────────────────────────────────────────
// Default setting values
// These variables are the single source-of-truth for initial state.
// When JSON saving is implemented, these will be overridden by persisted values.
// ─────────────────────────────────────────────

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_FONT_FAMILY = 'Geist Mono, monospace';
const DEFAULT_LINE_HEIGHT = 24;
const DEFAULT_TAB_SIZE = 4;
const DEFAULT_WORD_WRAP = 'off';
const DEFAULT_MINIMAP = false;
const DEFAULT_LINE_NUMBERS = 'on';
const DEFAULT_CURSOR_STYLE = 'line';
const DEFAULT_CURSOR_BLINKING = 'blink';
const DEFAULT_FONT_LIGATURES = true;
const DEFAULT_SCROLL_BEYOND_LAST_LINE = false;
const DEFAULT_RENDER_WHITESPACE = 'none';
const DEFAULT_BRACKET_PAIR_COLORIZATION = true;

export interface EditorSettings {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    tabSize: number;
    wordWrap: string;
    minimap: boolean;
    lineNumbers: string;
    cursorStyle: string;
    cursorBlinking: string;
    fontLigatures: boolean;
    scrollBeyondLastLine: boolean;
    renderWhitespace: string;
    bracketPairColorization: boolean;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT_FAMILY,
    lineHeight: DEFAULT_LINE_HEIGHT,
    tabSize: DEFAULT_TAB_SIZE,
    wordWrap: DEFAULT_WORD_WRAP,
    minimap: DEFAULT_MINIMAP,
    lineNumbers: DEFAULT_LINE_NUMBERS,
    cursorStyle: DEFAULT_CURSOR_STYLE,
    cursorBlinking: DEFAULT_CURSOR_BLINKING,
    fontLigatures: DEFAULT_FONT_LIGATURES,
    scrollBeyondLastLine: DEFAULT_SCROLL_BEYOND_LAST_LINE,
    renderWhitespace: DEFAULT_RENDER_WHITESPACE,
    bracketPairColorization: DEFAULT_BRACKET_PAIR_COLORIZATION,
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SettingRow({ setting, onChange }: { setting: SettingDefinition<any>; onChange: (key: string, value: any) => void }) {
    return (
        <div className="setting_row">
            <div className="setting_info">
                <span className="setting_name">{setting.displayName}</span>
                {setting.description && (
                    <span className="setting_description">{setting.description}</span>
                )}
                <code className="setting_property">{setting.monacoProperty}</code>
            </div>
            <div className="setting_control">
                {setting.type === 'number' && (
                    <input
                        type="number"
                        className="setting_input"
                        value={setting.value as number}
                        min={setting.min}
                        max={setting.max}
                        step={setting.step ?? 1}
                        onChange={(e) => onChange(setting.key, Number(e.target.value))}
                    />
                )}
                {setting.type === 'font' && (
                    <input
                        type="text"
                        className="setting_input setting_input--text"
                        value={setting.value as string}
                        onChange={(e) => onChange(setting.key, e.target.value)}
                        placeholder="Font family name..."
                    />
                )}
                {setting.type === 'select' && (
                    <select
                        className="setting_select"
                        value={String(setting.value)}
                        onChange={(e) => {
                            const opt = setting.options?.find(o => String(o.value) === e.target.value);
                            onChange(setting.key, opt ? opt.value : e.target.value);
                        }}
                    >
                        {setting.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )}
                {setting.type === 'toggle' && (
                    <button
                        className={`setting_toggle ${setting.value ? 'active' : ''}`}
                        onClick={() => onChange(setting.key, !setting.value)}
                        aria-pressed={!!setting.value}
                        role="switch"
                    >
                        <span className="toggle_knob" />
                    </button>
                )}
            </div>
        </div>
    );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="setting_section">
            <h3 className="setting_section_title">{title}</h3>
            <div className="setting_section_items">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Settings component
// ─────────────────────────────────────────────

interface SettingsProps {
    settings: EditorSettings;
    onSettingChange: (key: keyof EditorSettings, value: any) => void;
    onOpenSettingsFolder: () => void;
}

export default function Settings({ settings, onSettingChange, onOpenSettingsFolder }: SettingsProps) {

    // Build setting definitions dynamically from current settings state
    const fontSettings: SettingDefinition<any>[] = [
        {
            key: 'fontSize',
            displayName: 'Font Size',
            monacoProperty: 'editor.fontSize',
            description: 'Controls the font size in pixels in the editor.',
            type: 'number',
            value: settings.fontSize,
            min: 8,
            max: 40,
            step: 1,
        },
        {
            key: 'fontFamily',
            displayName: 'Font Family',
            monacoProperty: 'editor.fontFamily',
            description: 'Controls the font family used in the editor.',
            type: 'font',
            value: settings.fontFamily,
        },
        {
            key: 'lineHeight',
            displayName: 'Line Height',
            monacoProperty: 'editor.lineHeight',
            description: 'Controls the line height. 0 means use the default.',
            type: 'number',
            value: settings.lineHeight,
            min: 0,
            max: 60,
            step: 1,
        },
        {
            key: 'fontLigatures',
            displayName: 'Font Ligatures',
            monacoProperty: 'editor.fontLigatures',
            description: 'Enables / disables font ligatures.',
            type: 'toggle',
            value: settings.fontLigatures,
        },
    ];

    const editorSettings: SettingDefinition<any>[] = [
        {
            key: 'tabSize',
            displayName: 'Tab Size',
            monacoProperty: 'editor.tabSize',
            description: 'The number of spaces a tab is equal to.',
            type: 'number',
            value: settings.tabSize,
            min: 1,
            max: 16,
        },
        {
            key: 'wordWrap',
            displayName: 'Word Wrap',
            monacoProperty: 'editor.wordWrap',
            description: 'Controls how lines should wrap.',
            type: 'select',
            value: settings.wordWrap,
            options: [
                { label: 'Off', value: 'off' },
                { label: 'On', value: 'on' },
                { label: 'Word Wrap Column', value: 'wordWrapColumn' },
                { label: 'Bounded', value: 'bounded' },
            ],
        },
        {
            key: 'lineNumbers',
            displayName: 'Line Numbers',
            monacoProperty: 'editor.lineNumbers',
            description: 'Controls the display of line numbers.',
            type: 'select',
            value: settings.lineNumbers,
            options: [
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
                { label: 'Relative', value: 'relative' },
                { label: 'Interval', value: 'interval' },
            ],
        },
        {
            key: 'renderWhitespace',
            displayName: 'Render Whitespace',
            monacoProperty: 'editor.renderWhitespace',
            description: 'Controls rendering of whitespace characters.',
            type: 'select',
            value: settings.renderWhitespace,
            options: [
                { label: 'None', value: 'none' },
                { label: 'Boundary', value: 'boundary' },
                { label: 'Selection', value: 'selection' },
                { label: 'Trailing', value: 'trailing' },
                { label: 'All', value: 'all' },
            ],
        },
        {
            key: 'scrollBeyondLastLine',
            displayName: 'Scroll Beyond Last Line',
            monacoProperty: 'editor.scrollBeyondLastLine',
            description: 'Controls whether the editor will scroll beyond the last line.',
            type: 'toggle',
            value: settings.scrollBeyondLastLine,
        },
        {
            key: 'bracketPairColorization',
            displayName: 'Bracket Pair Colorization',
            monacoProperty: 'editor.bracketPairColorization.enabled',
            description: 'Controls whether bracket pair colorization is enabled.',
            type: 'toggle',
            value: settings.bracketPairColorization,
        },
    ];

    const cursorSettings: SettingDefinition<any>[] = [
        {
            key: 'cursorStyle',
            displayName: 'Cursor Style',
            monacoProperty: 'editor.cursorStyle',
            description: 'Controls the cursor style.',
            type: 'select',
            value: settings.cursorStyle,
            options: [
                { label: 'Line', value: 'line' },
                { label: 'Block', value: 'block' },
                { label: 'Underline', value: 'underline' },
                { label: 'Line (thin)', value: 'line-thin' },
                { label: 'Block (outline)', value: 'block-outline' },
                { label: 'Underline (thin)', value: 'underline-thin' },
            ],
        },
        {
            key: 'cursorBlinking',
            displayName: 'Cursor Blinking',
            monacoProperty: 'editor.cursorBlinking',
            description: 'Controls the cursor animation style.',
            type: 'select',
            value: settings.cursorBlinking,
            options: [
                { label: 'Blink', value: 'blink' },
                { label: 'Smooth', value: 'smooth' },
                { label: 'Phase', value: 'phase' },
                { label: 'Expand', value: 'expand' },
                { label: 'Solid', value: 'solid' },
            ],
        },
    ];

    const uiSettings: SettingDefinition<any>[] = [
        {
            key: 'minimap',
            displayName: 'Minimap',
            monacoProperty: 'editor.minimap.enabled',
            description: 'Controls whether the minimap is shown.',
            type: 'toggle',
            value: settings.minimap,
        },
    ];

    const handleChange = (key: string, value: any) => {
        onSettingChange(key as keyof EditorSettings, value);
    };

    return (
        <div className="settings_panel">
            <div className="settings_header">
                <h2 className="settings_title">Settings</h2>
                <p className="settings_subtitle">Configure your editor preferences</p>
            </div>
            <div className="settings_body">
                <SettingSection title="Font">
                    {fontSettings.map((s) => (
                        <SettingRow key={s.key} setting={s} onChange={handleChange} />
                    ))}
                </SettingSection>

                <SettingSection title="Editor">
                    {editorSettings.map((s) => (
                        <SettingRow key={s.key} setting={s} onChange={handleChange} />
                    ))}
                </SettingSection>

                <SettingSection title="Cursor">
                    {cursorSettings.map((s) => (
                        <SettingRow key={s.key} setting={s} onChange={handleChange} />
                    ))}
                </SettingSection>

                <SettingSection title="UI">
                    {uiSettings.map((s) => (
                        <SettingRow key={s.key} setting={s} onChange={handleChange} />
                    ))}
                </SettingSection>

                <div className="settings_footer">
                    <button className="settings_folder_btn" onClick={onOpenSettingsFolder}>
                        Open settings.json
                    </button>
                </div>
            </div>
        </div>
    );
}
