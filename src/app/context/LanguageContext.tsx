import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi" | "gu";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.queue": "Queue",
    "nav.map": "Map",
    "nav.alerts": "Alerts",
    "nav.profile": "Profile",

    // Home Screen
    "home.greeting": "Jai Shri Ram 🙏",
    "home.templeLocation": "Somnath Temple, Gujarat",

    "home.nearbyTemples": "Nearby Temples",
    "home.seeAll": "See All",
    "home.quickActions": "Quick Actions",
    "home.actionBooking": "Darshan Booking",
    "home.actionQueue": "Live Queue Status",
    "home.actionMap": "Temple Map",
    "home.actionSos": "SOS Emergency",

    // Queue Booking
    "queue.title": "Book Darshan Slot",
    "queue.temple": "Somnath Temple",
    "queue.selectDate": "Select Date",
    "queue.selectTime": "Select Time Slot",
    "queue.pilgrimDetails": "Pilgrim Details",
    "queue.fullName": "Full Name",
    "queue.phone": "Phone Number",
    "queue.priorityAccess": "Need Priority Access",
    "queue.priorityDesc": "Elderly, wheelchair, medical need",
    "queue.numDevotees": "Number of Devotees",
    "queue.confirm": "Confirm Booking",
    "queue.today": "TODAY",
    "queue.slotFull": "Full",
    "queue.slotLeft": "left",

    // Live Queue Screen
    "live.title": "Live Queue Status",
    "live.estWait": "Estimated Wait",
    "live.yourNumber": "Your Queue Number",
    "live.currentServing": "Current Serving",
    "live.gateNumber": "Gate Number",
    "live.status": "Status",
    "live.active": "Active",
    "live.scanQr": "Scan QR at Entrance",
    "live.back": "Back to Home",
    "live.peopleAhead": "people ahead",
    "live.cancel": "Cancel Slot",
    "live.feed": "Live Queue Feed",
    "live.waiting": "Waiting",
    "live.called": "Called",
    "live.yourToken": "Your Token",

    // Map Screen
    "map.title": "Temple Complex Map",
    "map.facilities": "Facilities",
    "map.exit": "Emergency Exit",
    "map.water": "Drinking Water",
    "map.restroom": "Restrooms",
    "map.medical": "Medical Room",
    "map.help": "Help Desk",
    "map.entryGate": "Entry Gate",
    "map.shrine": "Main Shrine",
    "map.prasad": "Prasad Counter",
    "map.firstAid": "First Aid",
    "map.parking": "Parking",
    "map.corridor": "Corridor",
    "map.legend": "Zone Legend",
    "map.routes": "Routes",
    "map.crowdLow": "Low",
    "map.crowdMod": "Moderate",
    "map.crowdHigh": "High",

    // Emergency Screen
    "sos.title": "Emergency Alert",
    "sos.trigger": "SOS Emergency Trigger",
    "sos.hold": "TAP AND HOLD FOR 3 SECONDS",
    "sos.report": "Report Incident",
    "sos.crowded": "Crowded Area",
    "sos.medical": "Medical Help",
    "sos.lost": "Lost & Found",
    "sos.other": "Other issues",
    "sos.sending": "Sending SOS...",
    "sos.sent": "SOS Alert Sent Successfully!",
    "sos.contacts": "Emergency Contacts",
    "sos.imSafe": "I'm Safe",
    "sos.needHelp": "I Need Help — SOS",
    "sos.markedSafe": "You're Marked Safe",
    "sos.markedSafeDesc": "Emergency services have been notified. Stay calm and follow staff instructions."
  },
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.queue": "कतार",
    "nav.map": "नक्शा",
    "nav.alerts": "अलर्ट",
    "nav.profile": "प्रोफ़ाइल",

    // Home Screen
    "home.greeting": "जय श्री राम 🙏",
    "home.templeLocation": "सोमनाथ मंदिर, गुजरात",

    "home.nearbyTemples": "आसपास के मंदिर",
    "home.seeAll": "सभी देखें",
    "home.quickActions": "त्वरित विकल्प",
    "home.actionBooking": "दर्शन बुकिंग",
    "home.actionQueue": "लाइव कतार स्थिति",
    "home.actionMap": "मंदिर का नक्शा",
    "home.actionSos": "एसओएस आपातकालीन",

    // Queue Booking
    "queue.title": "दर्शन स्लॉट बुक करें",
    "queue.temple": "सोमनाथ मंदिर",
    "queue.selectDate": "तारीख चुनें",
    "queue.selectTime": "समय स्लॉट चुनें",
    "queue.pilgrimDetails": "यात्री विवरण",
    "queue.fullName": "पूरा नाम",
    "queue.phone": "फ़ोन नंबर",
    "queue.priorityAccess": "प्राथमिकता पहुंच की आवश्यकता है",
    "queue.priorityDesc": "बुजुर्ग, व्हीलचेयर, चिकित्सा आवश्यकता",
    "queue.numDevotees": "श्रद्धालुओं की संख्या",
    "queue.confirm": "बुकिंग की पुष्टि करें",
    "queue.today": "आज",
    "queue.slotFull": "हाउसफुल",
    "queue.slotLeft": "बचे हैं",

    // Live Queue Screen
    "live.title": "लाइव कतार स्थिति",
    "live.estWait": "अनुमानित प्रतीक्षा",
    "live.yourNumber": "आपका कतार नंबर",
    "live.currentServing": "अभी दर्शन कर रहे हैं",
    "live.gateNumber": "गेट नंबर",
    "live.status": "स्थिति",
    "live.active": "सक्रिय",
    "live.scanQr": "प्रवेश द्वार पर क्यूआर स्कैन करें",
    "live.back": "होम पर वापस जाएं",
    "live.peopleAhead": "लोग आगे",
    "live.cancel": "स्लॉट रद्द करें",
    "live.feed": "लाइव कतार फीड",
    "live.waiting": "प्रतीक्षा सूची",
    "live.called": "बुलाया गया",
    "live.yourToken": "आपका टोकन",

    // Map Screen
    "map.title": "मंदिर परिसर का नक्शा",
    "map.facilities": "सुविधाएं",
    "map.exit": "आपातकालीन निकास",
    "map.water": "पीने का पानी",
    "map.restroom": "शौचालय",
    "map.medical": "चिकित्सा कक्ष",
    "map.help": "सहायता केंद्र",
    "map.entryGate": "प्रवेश द्वार",
    "map.shrine": "मुख्य मंदिर",
    "map.prasad": "प्रसाद काउंटर",
    "map.firstAid": "प्राथमिक उपचार",
    "map.parking": "पार्किंग",
    "map.corridor": "गलियारा",
    "map.legend": "जोन सूची",
    "map.routes": "मार्ग",
    "map.crowdLow": "कम भीड़",
    "map.crowdMod": "मध्यम भीड़",
    "map.crowdHigh": "अधिक भीड़",

    // Emergency Screen
    "sos.title": "आपातकालीन अलर्ट",
    "sos.trigger": "एसओएस आपातकालीन ट्रिगर",
    "sos.hold": "3 सेकंड के लिए दबाकर रखें",
    "sos.report": "घटना की रिपोर्ट करें",
    "sos.crowded": "अत्यधिक भीड़ वाला क्षेत्र",
    "sos.medical": "चिकित्सा सहायता",
    "sos.lost": "खोया-पाया",
    "sos.other": "अन्य समस्याएं",
    "sos.sending": "एसओएस भेज रहा है...",
    "sos.sent": "एसओएस अलर्ट सफलतापूर्वक भेजा गया!",
    "sos.contacts": "आपातकालीन संपर्क",
    "sos.imSafe": "मैं सुरक्षित हूँ",
    "sos.needHelp": "मुझे मदद चाहिए — एसओएस",
    "sos.markedSafe": "आप सुरक्षित चिह्नित हैं",
    "sos.markedSafeDesc": "आपातकालीन सेवाओं को सूचित कर दिया गया है। शांत रहें और कर्मचारियों के निर्देशों का पालन करें।"
  },
  gu: {
    // Navigation
    "nav.home": "હોમ",
    "nav.queue": "કતાર",
    "nav.map": "નક્શો",
    "nav.alerts": "સંદેશા",
    "nav.profile": "પ્રોફાઇલ",

    // Home Screen
    "home.greeting": "જય શ્રી રામ 🙏",
    "home.templeLocation": "સોમનાથ મંદિર, ગુજરાત",

    "home.nearbyTemples": "નજીકના મંદિરો",
    "home.seeAll": "બધા જુઓ",
    "home.quickActions": "ઝડપી વિકલ્પો",
    "home.actionBooking": "દર્શન બુકિંગ",
    "home.actionQueue": "લાઈવ કતાર સ્થિતિ",
    "home.actionMap": "મંદિરનો નકશો",
    "home.actionSos": "SOS કટોકટી",

    // Queue Booking
    "queue.title": "દર્શન સ્લોટ બુક કરો",
    "queue.temple": "સોમનાથ મંદિર",
    "queue.selectDate": "તારીખ પસંદ કરો",
    "queue.selectTime": "સમય સ્લોટ પસંદ કરો",
    "queue.pilgrimDetails": "યાત્રી વિગતો",
    "queue.fullName": "પૂરું નામ",
    "queue.phone": "ફોન નંબર",
    "queue.priorityAccess": "પ્રાથમિકતા પ્રવેશની જરૂર છે",
    "queue.priorityDesc": "વૃદ્ધો, વ્હીલચેર, તબીબી જરૂરિયાત",
    "queue.numDevotees": "શ્રદ્ધાળુઓની સંખ્યા",
    "queue.confirm": "બુકિંગ કન્ફર્મ કરો",
    "queue.today": "આજે",
    "queue.slotFull": "ભરેલું",
    "queue.slotLeft": "બાકી",

    // Live Queue Screen
    "live.title": "લાઈવ કતાર સ્થિતિ",
    "live.estWait": "અંદાજિત પ્રતિક્ષા",
    "live.yourNumber": "તમારો કતાર નંબર",
    "live.currentServing": "હાલ દર્શન કરી રહ્યા છે",
    "live.gateNumber": "ગેટ નંબર",
    "live.status": "સ્થિતિ",
    "live.active": "સક્રિય",
    "live.scanQr": "પ્રદેશદ્વાર પર QR સ્કેન કરો",
    "live.back": "હોમ પર પાછા જાઓ",
    "live.peopleAhead": "લોકો આગળ",
    "live.cancel": "સ્લોટ રદ કરો",
    "live.feed": "લાઈવ કતાર ફીડ",
    "live.waiting": "રાહ જોઈ રહ્યા છે",
    "live.called": "બોલાવેલ",
    "live.yourToken": "તમારો ટોકન",

    // Map Screen
    "map.title": "મંદિર પરિસરનો નકશો",
    "map.facilities": "સુવિધાઓ",
    "map.exit": "કટોકટી નિકાસ",
    "map.water": "પીવાનું પાણી",
    "map.restroom": "શૌચાલય",
    "map.medical": "મેડિકલ રૂમ",
    "map.help": "હેલ્પ ડેસ્ક",
    "map.entryGate": "પ્રવેશ દ્વાર",
    "map.shrine": "મુખ્ય મંદિર",
    "map.prasad": "પ્રસાદ કાઉન્ટર",
    "map.firstAid": "પ્રાથમિક સારવાર",
    "map.parking": "પાર્કિંગ",
    "map.corridor": "કોરિડોર",
    "map.legend": "ઝોન લેજેન્ડ",
    "map.routes": "માર્ગો",
    "map.crowdLow": "ઓછી ભીડ",
    "map.crowdMod": "મધ્યમ ભીડ",
    "map.crowdHigh": "વધારે ભીડ",

    // Emergency Screen
    "sos.title": "કટોકટી ચેતવણી",
    "sos.trigger": "SOS કટોકટી ટ્રિગર",
    "sos.hold": "૩ સેકન્ડ માટે દબાવી રાખો",
    "sos.report": "ઘટનાની જાણ કરો",
    "sos.crowded": "ભીડભાડ વાળો વિસ્તાર",
    "sos.medical": "તબીબી સહાય",
    "sos.lost": "ખોવાયેલ અને મળેલ",
    "sos.other": "અન્ય સમસ્યાઓ",
    "sos.sending": "SOS મોકલી રહ્યું છે...",
    "sos.sent": "SOS એલર્ટ સફળતાપૂર્વક મોકલવામાં આવ્યું!",
    "sos.contacts": "કટોકટી સંપર્ક",
    "sos.imSafe": "હું સુરક્ષિત છું",
    "sos.needHelp": "મને મદદ જોઈએ છે — SOS",
    "sos.markedSafe": "તમે સુરક્ષિત છો",
    "sos.markedSafeDesc": "કટોકટી સેવાઓને જાણ કરવામાં આવી છે. શાંત રહો અને કર્મચારીઓની સૂચનાઓનું પાલન કરો."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("yatra_lang");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("yatra_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
