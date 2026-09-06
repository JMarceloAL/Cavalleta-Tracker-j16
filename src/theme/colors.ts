export const APP_COLORS = {
    primary: '#56AC00',
    primaryDark: '#3F8200',
    primarySoft: '#56AC00',
    primaryLight: '#EAF7D8',
    white: '#FFFFFF',
    background: '#F4F8F0',
    backgroundAlt: '#EEF5E6',
    surface: '#FFFFFF',
    border: '#DDE9D2',
    text: '#1D2A1A',
    textMuted: '#5F6F5C',
    darkBackground: '#121821',
    darkSurface: '#1D2733',
};

export let APP_GREEN = APP_COLORS.primary;
export let APP_GREEN_DARK = APP_COLORS.primaryDark;
export let APP_GREEN_SOFT = APP_COLORS.primarySoft;

export function syncThemeToAppColors(themeName: AppThemeName) {
    const theme = APP_THEMES[themeName];
    if (!theme) return;

    APP_COLORS.primary = theme.colors.primary;
    APP_COLORS.background = theme.colors.background;
    APP_COLORS.backgroundAlt = theme.colors.backgroundAlt;
    APP_COLORS.surface = theme.colors.surface;
    APP_COLORS.border = theme.colors.border;
    APP_COLORS.text = theme.colors.text;
    APP_COLORS.textMuted = theme.colors.textMuted;
    APP_GREEN = APP_COLORS.primary;
    APP_GREEN_DARK = APP_COLORS.primaryDark;
    APP_GREEN_SOFT = APP_COLORS.primarySoft;
}
export type AppThemeName = 'light' | 'dark' | 'pastel' | 'cyberpunk' | 'retrowave';

export const APP_THEMES: Record<AppThemeName, {
    label: string;
    description: string;
    preview: string[];
    colors: {
        primary: string;
        background: string;
        backgroundAlt: string;
        surface: string;
        surfaceAlt: string;
        text: string;
        textMuted: string;
        border: string;
        input: string;
        buttonText: string;
        header: string;
    };
}> = {
    light: {
        label: 'Padrão',
        description: 'Visual limpo e neutro.',
        preview: ['#56AC00', '#F4F8F0', '#FFFFFF'],
        colors: {
            primary: '#56AC00',
            background: '#F4F8F0',
            backgroundAlt: '#EEF5E6',
            surface: '#FFFFFF',
            surfaceAlt: '#F6FAF3',
            text: '#1D2A1A',
            textMuted: '#5F6F5C',
            border: '#DDE9D2',
            input: '#F8FBF6',
            buttonText: '#FFFFFF',
            header: '#FFFFFF',
        },
    },
    dark: {
        label: 'Escuro',
        description: 'Modo noturno intenso.',
        preview: ['#56AC00', '#121821', '#1D2733'],
        colors: {
            primary: '#56AC00',
            background: '#121821',
            backgroundAlt: '#1A2430',
            surface: '#1D2733',
            surfaceAlt: '#243041',
            text: '#F3F4F6',
            textMuted: '#AFB9C7',
            border: '#2D3A49',
            input: '#1A2430',
            buttonText: '#FFFFFF',
            header: '#1A2330',
        },
    },
    pastel: {
        label: 'Pastel',
        description: 'Tom delicado e feminino.',
        preview: ['#F4A7B9', '#FDF4F7', '#F3E8FF'],
        colors: {
            primary: '#F4A7B9',
            background: '#FFF7FB',
            backgroundAlt: '#FDECF2',
            surface: '#FFFFFF',
            surfaceAlt: '#F9F0FF',
            text: '#2F2336',
            textMuted: '#7A647B',
            border: '#F5D7E2',
            input: '#FFF9FB',
            buttonText: '#FFFFFF',
            header: '#FFFFFF',
        },
    },
    cyberpunk: {
        label: 'Cyberpunk',
        description: 'Neon, energia e contraste.',
        preview: ['#FF2FB5', '#090B13', '#00F0FF'],
        colors: {
            primary: '#FF2FB5',
            background: '#090B13',
            backgroundAlt: '#111827',
            surface: '#131A2A',
            surfaceAlt: '#1B243B',
            text: '#F3F8FF',
            textMuted: '#A7B9FF',
            border: '#2C3D6F',
            input: '#0F1625',
            buttonText: '#FFFFFF',
            header: '#0D121D',
        },
    },
    retrowave: {
        label: 'Desert',
        description: 'Tom claro, quente e mais confortável para a visão.',
        preview: ['#F29B4D', '#FFF6EA', '#F7C68B'],
        colors: {
            primary: '#F29B4D',
            background: '#FFF7EF',
            backgroundAlt: '#FDE7D3',
            surface: '#FFFDF9',
            surfaceAlt: '#FBE5CF',
            text: '#4A2C1A',
            textMuted: '#8A5B3B',
            border: '#F2CFAE',
            input: '#FFF3E5',
            buttonText: '#FFFFFF',
            header: '#FFF2E5',
        },
    },
};

export const APP_THEME_OPTIONS: AppThemeName[] = ['light', 'pastel', 'cyberpunk', 'retrowave'];
