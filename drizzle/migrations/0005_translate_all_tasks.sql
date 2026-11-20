-- Migration 0005: Populate full multilingual translations for all tasks across all 9 target languages
-- Languages: en, ar, hi, fil, ne, si, ta, ur, bn

UPDATE public.tasks
SET 
  title_i18n = '{
    "en": "Dishwashing & Kitchen",
    "ar": "غسيل الصحون وتنظيف المطبخ",
    "hi": "बर्तन और रसोई की सफाई",
    "fil": "Hugas Pinggan at Linis Kusina",
    "ne": "भाँडा माझ्ने र भान्सा सफाइ",
    "si": "පිඟන් සේදීම සහ කුස්සිය පිරිසිදු කිරීම",
    "ta": "பாத்திரம் கழுவுதல் மற்றும் சமையலறை சுத்தம்",
    "ur": "برتن دھونا اور کچن کی صفائی",
    "bn": "বাসন মাজা ও রান্নাঘর পরিষ্কার"
  }'::jsonb,
  title_ar = 'غسيل الصحون وتنظيف المطبخ'
WHERE id = 'f7162c92-54e6-4b46-b6a7-e42bfd5a1133' OR title = 'Dishwashing & Kitchen';

UPDATE public.tasks
SET 
  title_i18n = '{
    "en": "Floor Mopping",
    "ar": "مسح وتنظيف الأرضيات",
    "hi": "झाड़ू-पोछा",
    "fil": "Pag-mop ng Sahig",
    "ne": "भुइँ बढार्ने र पोछा लगाउने",
    "si": "ගෙබිම අතුගෑම සහ පිසදැමීම",
    "ta": "வீடு கூட்டுதல் மற்றும் தரை துடைத்தல்",
    "ur": "جھاڑو اور پوچا",
    "bn": "ঘর ঝাড়ু দেওয়া ও মোছা"
  }'::jsonb,
  title_ar = 'مسح وتنظيف الأرضيات'
WHERE id = '7dac8014-3341-452a-a7f5-d6608cee9a1d' OR title = 'Floor Mopping';

UPDATE public.tasks
SET 
  title_i18n = '{
    "en": "Laundry",
    "ar": "غسيل وترتيب الملابس",
    "hi": "कपड़े धोना और तह करना",
    "fil": "Laba at Tiklop ng Damit",
    "ne": "लुगा धुने र पट्याउने",
    "si": "රෙදි සේදීම සහ නැවීම",
    "ta": "துணி துவைத்தல் மற்றும் மடித்தல்",
    "ur": "کپڑے دھونا اور تہہ کرنا",
    "bn": "কাপড় কাচা ও ভাঁজ করা"
  }'::jsonb,
  title_ar = 'غسيل وترتيب الملابس'
WHERE id = '1accb968-70b4-4103-9e0f-af4614ef6e81' OR title = 'Laundry';

UPDATE public.tasks
SET 
  title_i18n = '{
    "en": "Water Plants",
    "ar": "سقي النباتات والزرع",
    "hi": "पौधों को पानी देना",
    "fil": "Dilig ng Halaman",
    "ne": "बिरुवामा पानी हाल्ने",
    "si": "පැළවලට වතුර දැමීම",
    "ta": "செடிகளுக்கு தண்ணீர் ஊற்றுதல்",
    "ur": "پودوں کو پانی دینا",
    "bn": "গাছে পানি দেওয়া"
  }'::jsonb,
  title_ar = 'سقي النباتات والزرع'
WHERE id = 'c8f4af9f-f183-4bb0-bec2-8a931fdfc201' OR title = 'Water Plants';

UPDATE public.tasks
SET 
  title_i18n = '{
    "en": "Bathroom Cleaning",
    "ar": "تنظيف الحمام",
    "hi": "बाथरूम की सफाई",
    "fil": "Linis ng Banyo (CR)",
    "ne": "बाथरुम सफाइ",
    "si": "නාන කාමරය පිරිසිදු කිරීම",
    "ta": "குளியலறை சுத்தம்",
    "ur": "باتھ روم کی صفائی",
    "bn": "বাথরুম পরিষ্কার"
  }'::jsonb,
  title_ar = 'تنظيف الحمام'
WHERE id = '82fd6061-ce56-47ca-a466-91223a6d83a0' OR title = 'Bathroom Cleaning';
