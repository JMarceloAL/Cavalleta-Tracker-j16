import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

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

const lightColors: ThemeColors = {
    primary: 'rgb(163, 204, 127)',
    background: '#F5F7F2',
    backgroundAlt: '#f5f5f5',
    surface: '#FFFFFF',
    surfaceAlt: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#E5E7EB',
    input: '#F9FAFB',
    buttonText: '#FFFFFF',
    header: '#FFFFFF',
};

const darkColors: ThemeColors = {
    primary: 'rgb(163, 204, 127)',
    background: '#121821',
    backgroundAlt: '#18212d',
    surface: '#1d2733',
    surfaceAlt: '#243041',
    text: '#F3F4F6',
    textMuted: '#AFB9C7',
    border: '#2E3B4D',
    input: '#1B2430',
    buttonText: '#FFFFFF',
    header: '#1A2330',
};

const THEME_KEY = '@cavalleta:themeMode';

type ThemeContextType = {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: (value?: boolean) => Promise<void>;
    setTheme: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let active = true;

        AsyncStorage.getItem(THEME_KEY)
            .then((value) => {
                if (!active) return;
                setIsDark(value === 'dark');
            })
            .catch(() => undefined);

        return () => {
            active = false;
        };
    }, []);

    const colors = isDark ? darkColors : lightColors;

    const setTheme = async (mode: ThemeMode) => {
        const next = mode === 'dark';
        setIsDark(next);
        await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    };

    const toggleTheme = async (value?: boolean) => {
        const nextValue = typeof value === 'boolean' ? value : !isDark;
        await setTheme(nextValue ? 'dark' : 'light');
    };

    const value = useMemo<ThemeContextType>(() => ({
        isDark,
        colors,
        toggleTheme,
        setTheme,
    }), [isDark, colors]);

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
