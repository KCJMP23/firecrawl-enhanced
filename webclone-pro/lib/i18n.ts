// Internationalization system for WebClone Pro 2026
import React, { useState, useEffect } from 'react'

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh' | 'pt' | 'it' | 'ru'

export interface Translation {
  [key: string]: string | Translation
}

export interface TranslationNamespace {
  common: Translation
  dashboard: Translation
  projects: Translation
  templates: Translation
  teams: Translation
  analytics: Translation
  billing: Translation
  ai: Translation
  monitoring: Translation
  auth: Translation
  errors: Translation
}

// Translation storage
const translations: Record<Locale, Partial<TranslationNamespace>> = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      settings: 'Settings',
      help: 'Help',
      logout: 'Log out',
      welcome: 'Welcome',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      yes: 'Yes',
      no: 'No'
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Manage your website clones and AI projects',
      totalProjects: 'Total Projects',
      completed: 'Completed',
      inProgress: 'In Progress',
      creditsLeft: 'Credits Left',
      newProject: 'New Project',
      quickActions: 'Quick Actions',
      recentProjects: 'Recent Projects',
      cloneWebsite: 'Clone Website',
      aiModels: 'AI Models',
      aiRemix: 'AI Remix',
      deploy: 'Deploy',
      noProjects: 'No projects found',
      createProject: 'Create Project',
      welcomeBack: 'Welcome back'
    },
    projects: {
      name: 'Project Name',
      description: 'Description',
      url: 'Website URL',
      status: 'Status',
      progress: 'Progress',
      created: 'Created',
      updated: 'Updated',
      pending: 'Pending',
      cloning: 'Cloning',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      pause: 'Pause',
      resume: 'Resume',
      delete: 'Delete',
      edit: 'Edit',
      aiChat: 'AI Chat'
    },
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      signInWithGoogle: 'Sign in with Google',
      signInWithGitHub: 'Sign in with GitHub',
      welcomeBack: 'Welcome back',
      createAccount: 'Create your account'
    },
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Please check your connection.',
      notFound: 'The requested resource was not found.',
      unauthorized: 'You are not authorized to perform this action.',
      validation: 'Please check your input and try again.',
      serverError: 'Server error. Please try again later.'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      update: 'Actualizar',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      settings: 'Configuración',
      help: 'Ayuda',
      logout: 'Cerrar sesión',
      welcome: 'Bienvenido',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
      yes: 'Sí',
      no: 'No'
    },
    dashboard: {
      title: 'Panel de Control',
      subtitle: 'Gestiona tus clones de sitios web y proyectos de IA',
      totalProjects: 'Proyectos Totales',
      completed: 'Completados',
      inProgress: 'En Progreso',
      creditsLeft: 'Créditos Restantes',
      newProject: 'Nuevo Proyecto',
      quickActions: 'Acciones Rápidas',
      recentProjects: 'Proyectos Recientes',
      cloneWebsite: 'Clonar Sitio Web',
      aiModels: 'Modelos de IA',
      aiRemix: 'Remix de IA',
      deploy: 'Desplegar',
      noProjects: 'No se encontraron proyectos',
      createProject: 'Crear Proyecto',
      welcomeBack: 'Bienvenido de vuelta'
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      update: 'Mettre à jour',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      settings: 'Paramètres',
      help: 'Aide',
      logout: 'Déconnexion',
      welcome: 'Bienvenue',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      yes: 'Oui',
      no: 'Non'
    },
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Gérez vos clones de sites web et projets IA',
      totalProjects: 'Projets totaux',
      completed: 'Terminés',
      inProgress: 'En cours',
      creditsLeft: 'Crédits restants',
      newProject: 'Nouveau projet',
      quickActions: 'Actions rapides',
      recentProjects: 'Projets récents',
      cloneWebsite: 'Cloner un site web',
      aiModels: 'Modèles IA',
      aiRemix: 'Remix IA',
      deploy: 'Déployer',
      noProjects: 'Aucun projet trouvé',
      createProject: 'Créer un projet',
      welcomeBack: 'Bon retour'
    }
  },
  // Additional languages would be added here
  de: {
    common: {
      loading: 'Laden...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      welcome: 'Willkommen'
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Verwalten Sie Ihre Website-Klone und KI-Projekte',
      newProject: 'Neues Projekt'
    }
  },
  ja: {
    common: {
      loading: '読み込み中...',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      welcome: 'ようこそ'
    },
    dashboard: {
      title: 'ダッシュボード',
      subtitle: 'ウェブサイトクローンとAIプロジェクトを管理',
      newProject: '新しいプロジェクト'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '생성',
      welcome: '환영합니다'
    },
    dashboard: {
      title: '대시보드',
      subtitle: '웹사이트 클론 및 AI 프로젝트 관리',
      newProject: '새 프로젝트'
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      welcome: '欢迎'
    },
    dashboard: {
      title: '仪表板',
      subtitle: '管理您的网站克隆和AI项目',
      newProject: '新项目'
    }
  },
  pt: {
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      welcome: 'Bem-vindo'
    },
    dashboard: {
      title: 'Painel',
      subtitle: 'Gerencie seus clones de sites e projetos de IA',
      newProject: 'Novo Projeto'
    }
  },
  it: {
    common: {
      loading: 'Caricamento...',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      create: 'Crea',
      welcome: 'Benvenuto'
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Gestisci i tuoi cloni di siti web e progetti IA',
      newProject: 'Nuovo Progetto'
    }
  },
  ru: {
    common: {
      loading: 'Загрузка...',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      welcome: 'Добро пожаловать'
    },
    dashboard: {
      title: 'Панель управления',
      subtitle: 'Управляйте клонами сайтов и ИИ проектами',
      newProject: 'Новый проект'
    }
  }
}

// Locale information
export const locales: Record<Locale, { name: string; flag: string; rtl?: boolean }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  pt: { name: 'Português', flag: '🇧🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' }
}

export class I18nManager {
  private currentLocale: Locale = 'en'
  private listeners: ((locale: Locale) => void)[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved locale from localStorage
      const savedLocale = localStorage.getItem('webclone-locale') as Locale
      if (savedLocale && Object.keys(locales).includes(savedLocale)) {
        this.currentLocale = savedLocale
      } else {
        // Detect browser language
        this.currentLocale = this.detectBrowserLanguage()
      }

      // Update HTML lang attribute
      this.updateHtmlLang()
    }
  }

  private detectBrowserLanguage(): Locale {
    const browserLang = navigator.language.split('-')[0] as Locale
    return Object.keys(locales).includes(browserLang) ? browserLang : 'en'
  }

  private updateHtmlLang() {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.currentLocale
    }
  }

  public setLocale(locale: Locale) {
    if (Object.keys(locales).includes(locale)) {
      this.currentLocale = locale
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('webclone-locale', locale)
        this.updateHtmlLang()
      }

      this.notifyListeners(locale)
    }
  }

  public getLocale(): Locale {
    return this.currentLocale
  }

  public subscribe(callback: (locale: Locale) => void): () => void {
    this.listeners.push(callback)
    
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(locale: Locale) {
    this.listeners.forEach(callback => callback(locale))
  }

  public t(key: string, namespace: keyof TranslationNamespace = 'common'): string {
    const keys = key.split('.')
    const namespaceTranslations = translations[this.currentLocale]?.[namespace]
    
    if (!namespaceTranslations) {
      console.warn(`Missing namespace '${namespace}' for locale '${this.currentLocale}'`)
      return key
    }

    let result: any = namespaceTranslations
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // Fallback to English if key not found
        const englishNamespace = translations.en?.[namespace]
        if (englishNamespace) {
          let fallback: any = englishNamespace
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk]
            } else {
              console.warn(`Missing translation key '${key}' in namespace '${namespace}'`)
              return key
            }
          }
          return fallback as string
        }
        
        console.warn(`Missing translation key '${key}' in namespace '${namespace}'`)
        return key
      }
    }
    
    return typeof result === 'string' ? result : key
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat(this.currentLocale).format(value)
  }

  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale).format(date)
  }

  public formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  public formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale)
    const diffMs = date.getTime() - Date.now()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    
    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.round(diffMs / (1000 * 60 * 60))
      if (Math.abs(diffHours) < 1) {
        const diffMinutes = Math.round(diffMs / (1000 * 60))
        return rtf.format(diffMinutes, 'minute')
      }
      return rtf.format(diffHours, 'hour')
    }
    
    return rtf.format(diffDays, 'day')
  }
}

// React hook for translations
export function useTranslation(namespace: keyof TranslationNamespace = 'common') {
  const [locale, setLocale] = useState<Locale>('en')
  const i18n = new I18nManager()

  useEffect(() => {
    setLocale(i18n.getLocale())
    
    const unsubscribe = i18n.subscribe((newLocale) => {
      setLocale(newLocale)
    })

    return unsubscribe
  }, [i18n])

  const t = (key: string) => i18n.t(key, namespace)

  return {
    t,
    locale,
    setLocale: (newLocale: Locale) => i18n.setLocale(newLocale),
    formatNumber: (value: number) => i18n.formatNumber(value),
    formatDate: (date: Date) => i18n.formatDate(date),
    formatCurrency: (amount: number, currency?: string) => i18n.formatCurrency(amount, currency),
    formatRelativeTime: (date: Date) => i18n.formatRelativeTime(date)
  }
}

// Higher-order component for translations
export function withTranslations<T extends object>(
  Component: React.ComponentType<T>,
  namespace?: keyof TranslationNamespace
): React.ComponentType<T> {
  return function TranslatedComponent(props: T): React.ReactElement {
    const translation = useTranslation(namespace)
    
    return React.createElement(Component, { ...props, ...translation })
  }
}

// Global i18n instance
export const i18n = new I18nManager()

// Helper function to get translated text
export const t = (key: string, namespace: keyof TranslationNamespace = 'common') => {
  return i18n.t(key, namespace)
}