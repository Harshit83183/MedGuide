
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Package,
  ChevronRight,
  X,
  CheckCircle2,
  Info,
  ExternalLink,
  Loader2
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, inr } from '../lib/api';
import { useLanguage } from '../lib/language';

interface Medicine {
  id: number;
  drug_code: string;
  product_name: string;
  unit_size: string;
  mrp: number | null;
  category: string;
  source: string;
  source_url: string;
  source_updated_at: string | null;
  match_score: number;
  match_type: 'exact' | 'related' | 'catalogue';
  price_available: boolean;
}

interface MedicineResponse {
  products: Medicine[];
  exact: Medicine[];
  related: Medicine[];
  total: number;
  query: string;
  source: string;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

const CART_KEY = 'medguide_jan_aushadhi_cart';

const translations = {
  en: {
    kicker: 'Jan Aushadhi · Official PMBI Catalogue',
    title: 'Save on Medicine',
    subtitle: 'Search the Jan Aushadhi catalogue, check official MRP and create your medicine cart.',
    placeholder: 'Search by medicine, generic name or drug code...',
    search: 'Search Medicine',
    searching: 'Searching...',
    source: 'Catalogue source: Official PMBI / Jan Aushadhi product data',
    cart: 'Cart',
    loadError: 'Unable to load medicines.',
    searchError: 'Unable to search medicines.',
    loading: 'Loading the official catalogue...',
    searchResults: 'Search Results',
    exactCount: 'exact',
    relatedCount: 'related',
    exact: 'Exact Search Match',
    related: 'Related Product',
    catalogue: 'Official Catalogue',
    code: 'Drug Code',
    pack: 'Pack',
    category: 'Category',
    notListed: 'Not listed',
    relatedWarning: 'This is a related search result, not necessarily an exact substitute for the medicine you searched for.',
    mrp: 'Official MRP',
    per: 'per',
    add: 'Add to Cart',
    addAnother: 'Add Another',
    unavailable: 'MRP unavailable',
    unavailableDesc: 'No usable MRP is available in the imported official data.',
    noExact: 'No exact match found',
    noExactDesc: 'Related catalogue products may be available below.',
    relatedProducts: 'Related Products',
    similar: 'Similar search results',
    relatedDisclaimer: 'Composition or strength may differ. These products are not necessarily exact substitutes.',
    noMedicine: 'No medicine found',
    noMedicineDesc: 'Try searching by generic name, strength or drug code.',
    officialCatalogue: 'Official Catalogue',
    catalogueTitle: 'Jan Aushadhi Medicines',
    searchMore: 'Search to explore more catalogue products',
    medicineSafety: 'Do not switch medicines based on their names alone. Check composition, strength, dosage form and release type. Consult a doctor or pharmacist when needed.',
    medicineCart: 'Medicine Cart',
    cartTitle: 'Jan Aushadhi Cart',
    empty: 'Your cart is empty',
    emptyDesc: 'Search for medicines and add them to your cart.',
    total: 'Jan Aushadhi Total',
    totalDesc: 'Calculated using imported official PMBI MRP',
    checkout: 'Checkout & Compare',
    clear: 'Clear Cart',
    checkoutTitle: 'Medicine Cost Summary',
    officialTotal: 'Official Jan Aushadhi Total',
    medicines: 'Medicines',
    packs: 'Total packs',
    market: 'Market comparison',
    marketDesc: 'The Jan Aushadhi total is calculated using official PMBI MRP. Branded market totals and savings will only be shown when current, trustworthy comparison prices are available. No market prices are invented.',
    findKendra: 'Find Jan Aushadhi Kendra',
    stockNote: 'Catalogue MRP does not confirm current stock at any specific Kendra.',
    closeCart: 'Close cart',
    closeCheckout: 'Close checkout',
    remove: 'Remove medicine',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    clearSearch: 'Clear search'
  },
  hi: {
    kicker: 'जन औषधि · आधिकारिक PMBI कैटलॉग',
    title: 'दवाइयों पर बचत करें',
    subtitle: 'जन औषधि कैटलॉग में दवाइयां खोजें, आधिकारिक MRP देखें और अपना कार्ट बनाएं।',
    placeholder: 'दवा, जेनेरिक नाम या ड्रग कोड से खोजें...',
    search: 'दवा खोजें',
    searching: 'खोज जारी है...',
    source: 'कैटलॉग स्रोत: आधिकारिक PMBI / जन औषधि उत्पाद डेटा',
    cart: 'कार्ट',
    loadError: 'दवाइयां लोड नहीं हो सकीं।',
    searchError: 'दवा खोजने में समस्या हुई।',
    loading: 'आधिकारिक कैटलॉग लोड हो रहा है...',
    searchResults: 'खोज परिणाम',
    exactCount: 'सटीक',
    relatedCount: 'संबंधित',
    exact: 'सटीक खोज परिणाम',
    related: 'संबंधित उत्पाद',
    catalogue: 'आधिकारिक कैटलॉग',
    code: 'ड्रग कोड',
    pack: 'पैक',
    category: 'श्रेणी',
    notListed: 'उपलब्ध नहीं',
    relatedWarning: 'यह आपकी खोज से संबंधित उत्पाद है। इसे खोजी गई दवा का सटीक विकल्प न समझें।',
    mrp: 'आधिकारिक MRP',
    per: 'प्रति',
    add: 'कार्ट में जोड़ें',
    addAnother: 'एक और जोड़ें',
    unavailable: 'MRP उपलब्ध नहीं',
    unavailableDesc: 'आयात किए गए आधिकारिक डेटा में उपयोग योग्य MRP नहीं है।',
    noExact: 'सटीक परिणाम नहीं मिला',
    noExactDesc: 'नीचे संबंधित कैटलॉग उत्पाद उपलब्ध हो सकते हैं।',
    relatedProducts: 'संबंधित उत्पाद',
    similar: 'मिलते-जुलते खोज परिणाम',
    relatedDisclaimer: 'इनकी संरचना या ताकत अलग हो सकती है। ये जरूरी नहीं कि सटीक विकल्प हों।',
    noMedicine: 'दवा नहीं मिली',
    noMedicineDesc: 'जेनेरिक नाम, ताकत या ड्रग कोड से दोबारा खोजें।',
    officialCatalogue: 'आधिकारिक कैटलॉग',
    catalogueTitle: 'जन औषधि दवाइयां',
    searchMore: 'अधिक उत्पाद देखने के लिए खोजें',
    medicineSafety: 'केवल नाम देखकर दवा न बदलें। संरचना, ताकत, दवा का रूप और रिलीज प्रकार जांचें। जरूरत पड़ने पर डॉक्टर या फार्मासिस्ट से सलाह लें।',
    medicineCart: 'दवा कार्ट',
    cartTitle: 'जन औषधि कार्ट',
    empty: 'आपका कार्ट खाली है',
    emptyDesc: 'दवाइयां खोजकर कार्ट में जोड़ें।',
    total: 'जन औषधि कुल राशि',
    totalDesc: 'आयात किए गए आधिकारिक PMBI MRP के आधार पर',
    checkout: 'कुल राशि और तुलना',
    clear: 'कार्ट खाली करें',
    checkoutTitle: 'दवाइयों की लागत का सारांश',
    officialTotal: 'आधिकारिक जन औषधि कुल राशि',
    medicines: 'दवाइयां',
    packs: 'कुल पैक',
    market: 'बाजार मूल्य की तुलना',
    marketDesc: 'जन औषधि की कुल राशि आधिकारिक PMBI MRP से निकाली गई है। ब्रांडेड दवाइयों की कीमत और बचत तभी दिखाई जाएगी जब भरोसेमंद और वर्तमान कीमत उपलब्ध होगी।',
    findKendra: 'जन औषधि केंद्र खोजें',
    stockNote: 'कैटलॉग में दी गई MRP किसी विशेष केंद्र पर दवा की वर्तमान उपलब्धता की पुष्टि नहीं करती।',
    closeCart: 'कार्ट बंद करें',
    closeCheckout: 'सारांश बंद करें',
    remove: 'दवा हटाएं',
    decrease: 'मात्रा घटाएं',
    increase: 'मात्रा बढ़ाएं',
    clearSearch: 'खोज हटाएं'
  },
  hinglish: {
    kicker: 'Jan Aushadhi · Official PMBI Catalogue',
    title: 'Medicine Par Paise Bachayein',
    subtitle: 'Jan Aushadhi catalogue mein medicine search karein, official MRP dekhein aur apna cart banayein.',
    placeholder: 'Medicine, generic name ya drug code search karein...',
    search: 'Search Medicine',
    searching: 'Search ho raha hai...',
    source: 'Catalogue source: Official PMBI / Jan Aushadhi product data',
    cart: 'Cart',
    loadError: 'Medicines load nahi ho paayi.',
    searchError: 'Medicine search nahi ho paayi.',
    loading: 'Official catalogue load ho raha hai...',
    searchResults: 'Search Results',
    exactCount: 'exact',
    relatedCount: 'related',
    exact: 'Exact Search Match',
    related: 'Related Product',
    catalogue: 'Official Catalogue',
    code: 'Drug Code',
    pack: 'Pack',
    category: 'Category',
    notListed: 'Listed nahi hai',
    relatedWarning: 'Ye related product hai. Ise searched medicine ka exact substitute na samjhein.',
    mrp: 'Official MRP',
    per: 'per',
    add: 'Add to Cart',
    addAnother: 'Ek Aur Add Karein',
    unavailable: 'MRP unavailable',
    unavailableDesc: 'Official imported data mein usable MRP available nahi hai.',
    noExact: 'Exact match nahi mila',
    noExactDesc: 'Neeche related catalogue products mil sakte hain.',
    relatedProducts: 'Related Products',
    similar: 'Similar Search Results',
    relatedDisclaimer: 'Composition ya strength alag ho sakti hai. Ye zaroori nahi ki exact substitutes hon.',
    noMedicine: 'Medicine nahi mili',
    noMedicineDesc: 'Generic name, strength ya drug code se dobara search karein.',
    officialCatalogue: 'Official Catalogue',
    catalogueTitle: 'Jan Aushadhi Medicines',
    searchMore: 'Aur products dekhne ke liye search karein',
    medicineSafety: 'Sirf naam dekhkar medicine switch na karein. Composition, strength, dosage form aur release type check karein. Zarurat par doctor ya pharmacist se poochhein.',
    medicineCart: 'Medicine Cart',
    cartTitle: 'Jan Aushadhi Cart',
    empty: 'Aapka cart khali hai',
    emptyDesc: 'Medicine search karke cart mein add karein.',
    total: 'Jan Aushadhi Total',
    totalDesc: 'Official imported PMBI MRP ke basis par',
    checkout: 'Checkout & Compare',
    clear: 'Clear Cart',
    checkoutTitle: 'Medicine Cost Summary',
    officialTotal: 'Official Jan Aushadhi Total',
    medicines: 'Medicines',
    packs: 'Total Packs',
    market: 'Market Comparison',
    marketDesc: 'Jan Aushadhi total official PMBI MRP se calculate hua hai. Branded market prices aur savings tabhi dikhenge jab current trustworthy data available hoga.',
    findKendra: 'Find Jan Aushadhi Kendra',
    stockNote: 'Catalogue MRP se kisi specific Kendra ka current stock confirm nahi hota.',
    closeCart: 'Cart band karein',
    closeCheckout: 'Summary band karein',
    remove: 'Medicine remove karein',
    decrease: 'Quantity kam karein',
    increase: 'Quantity badhayein',
    clearSearch: 'Search clear karein'
  },
  mr: {
    kicker: 'जन औषधी · अधिकृत PMBI सूची',
    title: 'औषधांवर बचत करा',
    subtitle: 'जन औषधी सूचीमध्ये औषधे शोधा, अधिकृत MRP पाहा आणि तुमची औषधांची यादी तयार करा.',
    placeholder: 'औषध, जेनेरिक नाव किंवा औषध कोडने शोधा...',
    search: 'औषध शोधा',
    searching: 'शोध सुरू आहे...',
    source: 'सूचीचा स्रोत: अधिकृत PMBI / जन औषधी उत्पादन माहिती',
    cart: 'कार्ट',
    loadError: 'औषधे लोड करता आली नाहीत.',
    searchError: 'औषध शोधताना समस्या आली.',
    loading: 'अधिकृत सूची लोड होत आहे...',
    searchResults: 'शोध परिणाम',
    exactCount: 'अचूक',
    relatedCount: 'संबंधित',
    exact: 'अचूक शोध परिणाम',
    related: 'संबंधित उत्पादन',
    catalogue: 'अधिकृत सूची',
    code: 'औषध कोड',
    pack: 'पॅक',
    category: 'श्रेणी',
    notListed: 'नोंद उपलब्ध नाही',
    relatedWarning: 'हे संबंधित उत्पादन आहे. शोधलेल्या औषधाचा अचूक पर्याय म्हणून त्याचा विचार करू नका.',
    mrp: 'अधिकृत MRP',
    per: 'प्रति',
    add: 'कार्टमध्ये जोडा',
    addAnother: 'आणखी एक जोडा',
    unavailable: 'MRP उपलब्ध नाही',
    unavailableDesc: 'आयात केलेल्या अधिकृत माहितीत वापरण्यायोग्य MRP नाही.',
    noExact: 'अचूक परिणाम सापडला नाही',
    noExactDesc: 'खाली संबंधित उत्पादने उपलब्ध असू शकतात.',
    relatedProducts: 'संबंधित उत्पादने',
    similar: 'मिळतेजुळते शोध परिणाम',
    relatedDisclaimer: 'घटक किंवा औषधाची ताकद वेगळी असू शकते. ही अचूक पर्यायी औषधे असतीलच असे नाही.',
    noMedicine: 'औषध सापडले नाही',
    noMedicineDesc: 'जेनेरिक नाव, ताकद किंवा औषध कोडने पुन्हा शोधा.',
    officialCatalogue: 'अधिकृत सूची',
    catalogueTitle: 'जन औषधी औषधे',
    searchMore: 'अधिक उत्पादने पाहण्यासाठी शोधा',
    medicineSafety: 'केवळ नावावरून औषध बदलू नका. घटक, ताकद, औषधाचे स्वरूप आणि रिलीज प्रकार तपासा. गरज पडल्यास डॉक्टर किंवा फार्मासिस्टचा सल्ला घ्या.',
    medicineCart: 'औषधांचा कार्ट',
    cartTitle: 'जन औषधी कार्ट',
    empty: 'तुमचा कार्ट रिकामा आहे',
    emptyDesc: 'औषधे शोधून कार्टमध्ये जोडा.',
    total: 'जन औषधी एकूण रक्कम',
    totalDesc: 'आयात केलेल्या अधिकृत PMBI MRP नुसार',
    checkout: 'एकूण रक्कम आणि तुलना',
    clear: 'कार्ट रिकामा करा',
    checkoutTitle: 'औषध खर्चाचा सारांश',
    officialTotal: 'अधिकृत जन औषधी एकूण रक्कम',
    medicines: 'औषधे',
    packs: 'एकूण पॅक',
    market: 'बाजारभाव तुलना',
    marketDesc: 'जन औषधीची एकूण रक्कम अधिकृत PMBI MRP वर आधारित आहे. ब्रँडेड औषधांचे बाजारभाव आणि बचत केवळ विश्वसनीय अद्ययावत माहिती उपलब्ध असल्यास दाखवली जाईल.',
    findKendra: 'जन औषधी केंद्र शोधा',
    stockNote: 'सूचीतील MRP वरून कोणत्याही विशिष्ट केंद्रातील सध्याचा साठा निश्चित होत नाही.',
    closeCart: 'कार्ट बंद करा',
    closeCheckout: 'सारांश बंद करा',
    remove: 'औषध काढा',
    decrease: 'प्रमाण कमी करा',
    increase: 'प्रमाण वाढवा',
    clearSearch: 'शोध पुसा'
  },
  ta: {
    kicker: 'ஜன் ஔஷதி · அதிகாரப்பூர்வ PMBI பட்டியல்',
    title: 'மருந்துச் செலவைக் குறையுங்கள்',
    subtitle: 'ஜன் ஔஷதி பட்டியலில் மருந்துகளைத் தேடி, அதிகாரப்பூர்வ MRP-ஐப் பார்த்து உங்கள் மருந்துக் கூடையை உருவாக்குங்கள்.',
    placeholder: 'மருந்து, பொதுப்பெயர் அல்லது மருந்துக் குறியீட்டால் தேடுங்கள்...',
    search: 'மருந்தைத் தேடுங்கள்',
    searching: 'தேடப்படுகிறது...',
    source: 'பட்டியல் மூலம்: அதிகாரப்பூர்வ PMBI / ஜன் ஔஷதி தயாரிப்புத் தகவல்',
    cart: 'கூடை',
    loadError: 'மருந்துகளை ஏற்ற முடியவில்லை.',
    searchError: 'மருந்தைத் தேடுவதில் சிக்கல் ஏற்பட்டது.',
    loading: 'அதிகாரப்பூர்வ பட்டியல் ஏற்றப்படுகிறது...',
    searchResults: 'தேடல் முடிவுகள்',
    exactCount: 'துல்லியமானவை',
    relatedCount: 'தொடர்புடையவை',
    exact: 'துல்லியமான தேடல் முடிவு',
    related: 'தொடர்புடைய தயாரிப்பு',
    catalogue: 'அதிகாரப்பூர்வ பட்டியல்',
    code: 'மருந்துக் குறியீடு',
    pack: 'பொதி',
    category: 'வகை',
    notListed: 'பட்டியலில் இல்லை',
    relatedWarning: 'இது தொடர்புடைய தயாரிப்பு மட்டுமே. நீங்கள் தேடிய மருந்துக்கு இது துல்லியமான மாற்று என்று கருத வேண்டாம்.',
    mrp: 'அதிகாரப்பூர்வ MRP',
    per: 'ஒரு',
    add: 'கூடையில் சேர்க்கவும்',
    addAnother: 'மேலும் ஒன்றைச் சேர்க்கவும்',
    unavailable: 'MRP கிடைக்கவில்லை',
    unavailableDesc: 'இறக்குமதி செய்யப்பட்ட அதிகாரப்பூர்வ தரவில் பயன்படுத்தக்கூடிய MRP இல்லை.',
    noExact: 'துல்லியமான பொருத்தம் இல்லை',
    noExactDesc: 'தொடர்புடைய தயாரிப்புகள் கீழே இருக்கலாம்.',
    relatedProducts: 'தொடர்புடைய தயாரிப்புகள்',
    similar: 'ஒத்த தேடல் முடிவுகள்',
    relatedDisclaimer: 'மருந்தின் கலவை அல்லது வீரியம் வேறுபடலாம். இவை துல்லியமான மாற்று மருந்துகள் அல்ல.',
    noMedicine: 'மருந்து கிடைக்கவில்லை',
    noMedicineDesc: 'பொதுப்பெயர், வீரியம் அல்லது மருந்துக் குறியீட்டால் மீண்டும் தேடுங்கள்.',
    officialCatalogue: 'அதிகாரப்பூர்வ பட்டியல்',
    catalogueTitle: 'ஜன் ஔஷதி மருந்துகள்',
    searchMore: 'மேலும் தயாரிப்புகளைக் காணத் தேடுங்கள்',
    medicineSafety: 'பெயரை மட்டும் வைத்து மருந்தை மாற்ற வேண்டாம். கலவை, வீரியம், மருந்தின் வடிவம் மற்றும் வெளியீட்டு வகையைச் சரிபார்க்கவும். தேவைப்பட்டால் மருத்துவர் அல்லது மருந்தாளரிடம் ஆலோசிக்கவும்.',
    medicineCart: 'மருந்துக் கூடை',
    cartTitle: 'ஜன் ஔஷதி கூடை',
    empty: 'உங்கள் கூடை காலியாக உள்ளது',
    emptyDesc: 'மருந்துகளைத் தேடிக் கூடையில் சேர்க்கவும்.',
    total: 'ஜன் ஔஷதி மொத்தம்',
    totalDesc: 'இறக்குமதி செய்யப்பட்ட அதிகாரப்பூர்வ PMBI MRP அடிப்படையில்',
    checkout: 'செலவு மற்றும் ஒப்பீடு',
    clear: 'கூடையை காலி செய்யவும்',
    checkoutTitle: 'மருந்துச் செலவுச் சுருக்கம்',
    officialTotal: 'அதிகாரப்பூர்வ ஜன் ஔஷதி மொத்தம்',
    medicines: 'மருந்துகள்',
    packs: 'மொத்தப் பொதிகள்',
    market: 'சந்தை விலை ஒப்பீடு',
    marketDesc: 'ஜன் ஔஷதி மொத்தம் அதிகாரப்பூர்வ PMBI MRP அடிப்படையில் கணக்கிடப்படுகிறது. நம்பகமான தற்போதைய விலைத் தகவல் கிடைத்தால் மட்டுமே பிராண்டு மருந்துகளின் விலையும் சேமிப்பும் காட்டப்படும்.',
    findKendra: 'ஜன் ஔஷதி மையத்தைக் கண்டறியவும்',
    stockNote: 'பட்டியலில் உள்ள MRP ஒரு குறிப்பிட்ட மையத்தில் மருந்து தற்போது இருப்பதை உறுதிப்படுத்தாது.',
    closeCart: 'கூடையை மூடவும்',
    closeCheckout: 'சுருக்கத்தை மூடவும்',
    remove: 'மருந்தை நீக்கவும்',
    decrease: 'அளவைக் குறைக்கவும்',
    increase: 'அளவை அதிகரிக்கவும்',
    clearSearch: 'தேடலை அழிக்கவும்'
  },
  bn: {
    kicker: 'জন ঔষধি · সরকারি PMBI ক্যাটালগ',
    title: 'ওষুধের খরচ বাঁচান',
    subtitle: 'জন ঔষধি ক্যাটালগে ওষুধ খুঁজুন, সরকারি MRP দেখুন এবং নিজের ওষুধের কার্ট তৈরি করুন।',
    placeholder: 'ওষুধ, জেনেরিক নাম বা ড্রাগ কোড দিয়ে খুঁজুন...',
    search: 'ওষুধ খুঁজুন',
    searching: 'খোঁজা হচ্ছে...',
    source: 'ক্যাটালগের উৎস: সরকারি PMBI / জন ঔষধি পণ্যের তথ্য',
    cart: 'কার্ট',
    loadError: 'ওষুধ লোড করা যায়নি।',
    searchError: 'ওষুধ খুঁজতে সমস্যা হয়েছে।',
    loading: 'সরকারি ক্যাটালগ লোড হচ্ছে...',
    searchResults: 'অনুসন্ধানের ফলাফল',
    exactCount: 'সঠিক',
    relatedCount: 'সম্পর্কিত',
    exact: 'সঠিক অনুসন্ধানের ফলাফল',
    related: 'সম্পর্কিত পণ্য',
    catalogue: 'সরকারি ক্যাটালগ',
    code: 'ড্রাগ কোড',
    pack: 'প্যাক',
    category: 'বিভাগ',
    notListed: 'তালিকায় নেই',
    relatedWarning: 'এটি সম্পর্কিত পণ্য। আপনি যে ওষুধ খুঁজেছেন, তার সঠিক বিকল্প হিসেবে এটি ধরে নেবেন না।',
    mrp: 'সরকারি MRP',
    per: 'প্রতি',
    add: 'কার্টে যোগ করুন',
    addAnother: 'আরও একটি যোগ করুন',
    unavailable: 'MRP পাওয়া যায়নি',
    unavailableDesc: 'আমদানি করা সরকারি তথ্যে ব্যবহারযোগ্য MRP নেই।',
    noExact: 'সঠিক মিল পাওয়া যায়নি',
    noExactDesc: 'নিচে সম্পর্কিত ক্যাটালগ পণ্য পাওয়া যেতে পারে।',
    relatedProducts: 'সম্পর্কিত পণ্য',
    similar: 'একই ধরনের অনুসন্ধানের ফলাফল',
    relatedDisclaimer: 'উপাদান বা শক্তি আলাদা হতে পারে। এগুলো অবশ্যই সঠিক বিকল্প নয়।',
    noMedicine: 'ওষুধ পাওয়া যায়নি',
    noMedicineDesc: 'জেনেরিক নাম, শক্তি বা ড্রাগ কোড দিয়ে আবার খুঁজুন।',
    officialCatalogue: 'সরকারি ক্যাটালগ',
    catalogueTitle: 'জন ঔষধি ওষুধ',
    searchMore: 'আরও পণ্য দেখতে খুঁজুন',
    medicineSafety: 'শুধু নাম দেখে ওষুধ পরিবর্তন করবেন না। উপাদান, শক্তি, ওষুধের ধরন ও রিলিজের ধরন যাচাই করুন। প্রয়োজনে চিকিৎসক বা ফার্মাসিস্টের পরামর্শ নিন।',
    medicineCart: 'ওষুধের কার্ট',
    cartTitle: 'জন ঔষধি কার্ট',
    empty: 'আপনার কার্ট খালি',
    emptyDesc: 'ওষুধ খুঁজে কার্টে যোগ করুন।',
    total: 'জন ঔষধি মোট মূল্য',
    totalDesc: 'আমদানি করা সরকারি PMBI MRP অনুযায়ী',
    checkout: 'খরচ ও তুলনা',
    clear: 'কার্ট খালি করুন',
    checkoutTitle: 'ওষুধের খরচের সারাংশ',
    officialTotal: 'সরকারি জন ঔষধি মোট মূল্য',
    medicines: 'ওষুধ',
    packs: 'মোট প্যাক',
    market: 'বাজারদরের তুলনা',
    marketDesc: 'জন ঔষধির মোট মূল্য সরকারি PMBI MRP অনুযায়ী হিসাব করা হয়েছে। নির্ভরযোগ্য ও বর্তমান বাজারদর পাওয়া গেলেই ব্র্যান্ডেড ওষুধের দাম ও সাশ্রয় দেখানো হবে।',
    findKendra: 'জন ঔষধি কেন্দ্র খুঁজুন',
    stockNote: 'ক্যাটালগের MRP কোনো নির্দিষ্ট কেন্দ্রে বর্তমানে ওষুধ মজুত আছে কি না তা নিশ্চিত করে না।',
    closeCart: 'কার্ট বন্ধ করুন',
    closeCheckout: 'সারাংশ বন্ধ করুন',
    remove: 'ওষুধ সরান',
    decrease: 'পরিমাণ কমান',
    increase: 'পরিমাণ বাড়ান',
    clearSearch: 'অনুসন্ধান মুছুন'
  }
};

type Translation = typeof translations.en;
type Language = keyof typeof translations;

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;

      const entry = item as Partial<CartItem>;

      return (
        !!entry.medicine &&
        typeof entry.medicine.id === 'number' &&
        typeof entry.medicine.product_name === 'string' &&
        typeof entry.quantity === 'number' &&
        Number.isInteger(entry.quantity) &&
        entry.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

export default function Medicines() {
  const { lang } = useLanguage();
  const t: Translation =
    translations[lang as Language] || translations.en;

  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [products, setProducts] = useState<Medicine[]>([]);
  const [exact, setExact] = useState<Medicine[]>([]);
  const [related, setRelated] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    void loadCatalogue();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      setError(t.loadError);
    }
  }, [cart]);

  async function loadCatalogue() {
    setLoading(true);
    setError('');

    try {
      const data = await api<MedicineResponse>(
        '/api/medicines?limit=50'
      );

      setProducts(data.products || []);
      setExact([]);
      setRelated([]);
      setSearchedQuery('');
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  async function searchMedicine() {
    const value = query.trim();

    if (!value) {
      await loadCatalogue();
      return;
    }

    setSearching(true);
    setError('');

    try {
      const data = await api<MedicineResponse>(
        `/api/medicines?q=${encodeURIComponent(value)}&limit=50`
      );

      setProducts(data.products || []);
      setExact(data.exact || []);
      setRelated(data.related || []);
      setSearchedQuery(value);
    } catch {
      setProducts([]);
      setExact([]);
      setRelated([]);
      setError(t.searchError);
    } finally {
      setSearching(false);
    }
  }

  function addToCart(medicine: Medicine) {
    if (!medicine.price_available || medicine.mrp === null) {
      return;
    }

    setCart(current => {
      const existing = current.find(
        item => item.medicine.id === medicine.id
      );

      if (existing) {
        return current.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { medicine, quantity: 1 }];
    });
  }

  function changeQuantity(id: number, amount: number) {
    setCart(current =>
      current
        .map(item =>
          item.medicine.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeFromCart(id: number) {
    setCart(current =>
      current.filter(item => item.medicine.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
    setCheckoutOpen(false);
  }

  const cartQuantity = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const janAushadhiTotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const price = item.medicine.mrp;

        if (price === null || price <= 0) return total;

        return total + price * item.quantity;
      }, 0),
    [cart]
  );

  function MedicineCard({
    medicine,
    relatedProduct = false
  }: {
    medicine: Medicine;
    relatedProduct?: boolean;
  }) {
    const added = cart.some(
      item => item.medicine.id === medicine.id
    );

    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className={
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ' +
              (relatedProduct
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700')
            }
          >
            <Pill size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  'rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ' +
                  (relatedProduct
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700')
                }
              >
                {relatedProduct
                  ? t.related
                  : searchedQuery
                    ? t.exact
                    : t.catalogue}
              </span>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                PMBI
              </span>
            </div>

            <h3 className="mt-2 text-[15px] font-extrabold leading-6 text-[#0B1F3A]">
              {medicine.product_name}
            </h3>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span>
                <b className="text-slate-700">{t.code}:</b>{' '}
                {medicine.drug_code}
              </span>

              <span>
                <b className="text-slate-700">{t.pack}:</b>{' '}
                {medicine.unit_size || t.notListed}
              </span>

              <span>
                <b className="text-slate-700">{t.category}:</b>{' '}
                {medicine.category || t.notListed}
              </span>
            </div>

            {relatedProduct && (
              <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                <Info size={15} className="mt-0.5 shrink-0" />
                <span>{t.relatedWarning}</span>
              </div>
            )}
          </div>

          <div className="shrink-0 sm:min-w-[155px] sm:text-right">
            {medicine.price_available &&
            medicine.mrp !== null ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {t.mrp}
                </p>

                <p className="text-2xl font-extrabold text-emerald-700">
                  {inr(medicine.mrp)}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {t.per} {medicine.unit_size || t.pack}
                </p>

                <button
                  type="button"
                  onClick={() => addToCart(medicine)}
                  className={
                    'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ' +
                    (added
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-[#0B3D91] text-white hover:bg-[#092f70]')
                  }
                >
                  {added ? (
                    <>
                      <CheckCircle2 size={15} />
                      {t.addAnother}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} />
                      {t.add}
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-3 text-left sm:text-center">
                <p className="text-xs font-bold text-slate-600">
                  {t.unavailable}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {t.unavailableDesc}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        icon={<Pill size={28} />}
        kicker={t.kicker}
        title={t.title}
        sub={t.subtitle}
      />

      <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <form
          onSubmit={event => {
            event.preventDefault();
            void searchMedicine();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-slate-200 px-4 py-3 focus-within:border-blue-400">
            <Search size={19} className="shrink-0 text-slate-400" />

            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t.placeholder}
              aria-label={t.search}
              className="w-full bg-transparent text-sm outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t.clearSearch}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searching || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#092f70] disabled:opacity-60"
          >
            {searching && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {searching ? t.searching : t.search}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck
              size={14}
              className="shrink-0 text-emerald-600"
            />
            {t.source}
          </p>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200"
          >
            <ShoppingCart size={16} />
            {t.cart}
            {cartQuantity > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] text-white">
                {cartQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-slate-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }}
            className="mx-auto h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {t.loading}
          </p>
        </div>
      ) : searchedQuery ? (
        <div className="space-y-7">
          <Reveal>
            <div>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    {t.searchResults}
                  </p>
                  <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                    “{searchedQuery}”
                  </h2>
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {exact.length} {t.exactCount} · {related.length}{' '}
                  {t.relatedCount}
                </p>
              </div>

              {exact.length > 0 ? (
                <div className="space-y-3">
                  {exact.map(medicine => (
                    <MedicineCard
                      key={medicine.id}
                      medicine={medicine}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center">
                  <p className="font-extrabold text-[#0B1F3A]">
                    {t.noExact}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.noExactDesc}
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal>
              <div>
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    {t.relatedProducts}
                  </p>
                  <h2 className="text-lg font-extrabold text-[#0B1F3A]">
                    {t.similar}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.relatedDisclaimer}
                  </p>
                </div>

                <div className="space-y-3">
                  {related.map(medicine => (
                    <MedicineCard
                      key={medicine.id}
                      medicine={medicine}
                      relatedProduct
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {exact.length === 0 && related.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-100">
              <Search
                size={30}
                className="mx-auto text-slate-300"
              />
              <p className="mt-3 font-extrabold text-[#0B1F3A]">
                {t.noMedicine}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t.noMedicineDesc}
              </p>
            </div>
          )}
        </div>
      ) : (
        <Reveal>
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {t.officialCatalogue}
                </p>
                <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                  {t.catalogueTitle}
                </h2>
              </div>

              <p className="text-xs text-slate-400">
                {t.searchMore}
              </p>
            </div>

            <div className="space-y-3">
              {products.map(medicine => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-[13px] leading-5 text-blue-900">
        <p className="flex gap-2">
          <Info
            size={17}
            className="mt-0.5 shrink-0"
          />
          <span>{t.medicineSafety}</span>
        </p>
      </div>

      <div className="mt-3">
        <Disclaimer compact />
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setCartOpen(false)}
            aria-label={t.closeCart}
          />

          <motion.div
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={t.medicineCart}
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {t.medicineCart}
                </p>
                <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                  {t.cartTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label={t.closeCart}
                className="rounded-xl bg-slate-100 p-2 text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart
                    size={38}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-4 font-extrabold text-[#0B1F3A]">
                    {t.empty}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.emptyDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.medicine.id}
                      className="rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold leading-5 text-[#0B1F3A]">
                            {item.medicine.product_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.medicine.unit_size} · {t.code}{' '}
                            {item.medicine.drug_code}
                          </p>

                          <p className="mt-2 font-extrabold text-emerald-700">
                            {item.medicine.mrp !== null
                              ? inr(item.medicine.mrp)
                              : t.unavailable}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.medicine.id)
                          }
                          aria-label={t.remove}
                          className="self-start rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-xl border">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.medicine.id,
                                -1
                              )
                            }
                            aria-label={t.decrease}
                            className="p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-9 text-center text-sm font-extrabold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.medicine.id,
                                1
                              )
                            }
                            aria-label={t.increase}
                            className="p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="font-extrabold text-[#0B1F3A]">
                          {item.medicine.mrp !== null
                            ? inr(
                                item.medicine.mrp *
                                  item.quantity
                              )
                            : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">
                    {t.total}
                  </span>

                  <span className="text-2xl font-extrabold text-emerald-700">
                    {inr(janAushadhiTotal)}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  {t.totalDesc}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-3.5 text-sm font-extrabold text-white"
                >
                  {t.checkout}
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-2 w-full py-2 text-xs font-bold text-red-600"
                >
                  {t.clear}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setCheckoutOpen(false)}
            aria-label={t.closeCheckout}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-label={t.checkoutTitle}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {t.checkout}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#0B1F3A]">
                  {t.checkoutTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                aria-label={t.closeCheckout}
                className="rounded-xl bg-slate-100 p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {cart.map(item => (
                <div
                  key={item.medicine.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-[#0B1F3A]">
                        {item.medicine.product_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.medicine.unit_size} ×{' '}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 font-extrabold text-emerald-700">
                      {item.medicine.mrp !== null
                        ? inr(
                            item.medicine.mrp *
                              item.quantity
                          )
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                {t.officialTotal}
              </p>

              <p className="mt-1 text-4xl font-extrabold">
                {inr(janAushadhiTotal)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[11px] text-white/70">
                    {t.medicines}
                  </p>
                  <p className="text-lg font-extrabold">
                    {cart.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[11px] text-white/70">
                    {t.packs}
                  </p>
                  <p className="text-lg font-extrabold">
                    {cartQuantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-extrabold text-amber-900">
                {t.market}
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                {t.marketDesc}
              </p>
            </div>

            <a
              href="https://janaushadhi.gov.in/near-by-kendra"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-3.5 text-sm font-extrabold text-white"
            >
              {t.findKendra}
              <ExternalLink size={16} />
            </a>

            <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
              {t.stockNote}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}