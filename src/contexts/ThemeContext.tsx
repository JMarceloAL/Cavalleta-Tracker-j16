import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_THEMES, syncThemeToAppColors, type AppThemeName } from '../theme/colors';

type ThemeColors = {
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

const THEME_KEY = '@cavalleta:themeMode';

type ThemeContextType = {
    isDark: boolean;
    isReady: boolean;
    activeTheme: AppThemeName;
    colors: ThemeColors;
    toggleTheme: (value?: boolean) => Promise<void>;
    setTheme: (mode: AppThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [activeTheme, setActiveTheme] = useState<AppThemeName>('light');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let active = true;

        AsyncStorage.getItem(THEME_KEY)
            .then((value) => {
                if (!active) return;
                const nextTheme = (value as AppThemeName) || 'light';
                setActiveTheme(nextTheme in APP_THEMES ? nextTheme : 'light');
            })
            .catch(() => undefined)
            .finally(() => {
                if (active) setIsReady(true);
            });

        return () => {
            active = false;
        };
    }, []);

    const isDark = activeTheme === 'dark' || activeTheme === 'cyberpunk';
    const colors = APP_THEMES[activeTheme].colors;

    useEffect(() => {
        syncThemeToAppColors(activeTheme);
    }, [activeTheme]);

    const setTheme = async (mode: AppThemeName) => {
        setActiveTheme(mode);
        await AsyncStorage.setItem(THEME_KEY, mode);
    };

    const toggleTheme = async (value?: boolean) => {
        const nextValue = typeof value === 'boolean' ? value : !isDark;
        await setTheme(nextValue ? 'dark' : 'light');
    };

    const value = useMemo<ThemeContextType>(() => ({
        isDark,
        isReady,
        activeTheme,
        colors,
        toggleTheme,
        setTheme,
    }), [isDark, isReady, activeTheme, colors]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    }

    return context;
}
