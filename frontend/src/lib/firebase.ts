type FirebaseApp = unknown;
type Messaging = unknown;
type MessagePayload = unknown;
type Unsubscribe = () => void;

interface FirebaseAppModule {
  initializeApp: (config: Record<string, string>) => FirebaseApp;
  getApps: () => FirebaseApp[];
}

interface FirebaseMessagingModule {
  getMessaging: (app: FirebaseApp) => Messaging;
  getToken: (messaging: Messaging, options: { vapidKey?: string }) => Promise<string>;
  onMessage: (messaging: Messaging, callback: (payload: MessagePayload) => void) => Unsubscribe;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

async function loadFirebaseModules(): Promise<{
  appModule: FirebaseAppModule;
  messagingModule: FirebaseMessagingModule;
} | null> {
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>;
    const [appModule, messagingModule] = await Promise.all([
      dynamicImport<FirebaseAppModule>('firebase/app'),
      dynamicImport<FirebaseMessagingModule>('firebase/messaging'),
    ]);

    return { appModule, messagingModule };
  } catch {
    return null;
  }
}

function resolveApp(appModule: FirebaseAppModule): FirebaseApp {
  const apps = appModule.getApps();
  return apps.length === 0 ? appModule.initializeApp(firebaseConfig) : apps[0];
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const modules = await loadFirebaseModules();
    if (!modules) return null;

    const app = resolveApp(modules.appModule);
    const messaging = modules.messagingModule.getMessaging(app);
    const token = await modules.messagingModule.getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};

  loadFirebaseModules().then((modules) => {
    if (!modules) return;
    const app = resolveApp(modules.appModule);
    const messaging = modules.messagingModule.getMessaging(app);
    unsubscribe = modules.messagingModule.onMessage(messaging, callback);
  });

  return () => unsubscribe();
}
