import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Animação padrão, usada nos dropdowns em geral (TrackerDropdown, credenciais, etc.)
export function animateNextLayout() {
    LayoutAnimation.configureNext({
        duration: 300,
        create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
        },
        update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.8,
        },
        delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
        },
    });
}

// Animação mais suave/lenta, usada nas seções Status e Parâmetros da tela SMS
export function animateSectionLayout() {
    LayoutAnimation.configureNext({
        duration: 450,
        create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
        },
        update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.65,
        },
        delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
        },
    });
}