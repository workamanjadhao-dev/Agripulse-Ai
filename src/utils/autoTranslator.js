/**
 * AgriPulse Global Auto-Translator Engine
 * Translates the entire application (every page, option, card, button, and feature)
 * into Hindi (हिंदी) and Marathi (मराठी) dynamically across the DOM,
 * synchronized with Google Website Translate & native dictionary fallback.
 */

// 1. Comprehensive Agricultural & UI Dictionary
export const DICTIONARY = {
  hi: {
    // Navigation & Shell
    'AgriPulse AI': 'एग्रीपल्स एआई',
    'AgriPulse AI 2.0': 'एग्रीपल्स एआई 2.0',
    'Navigation Menu': 'नेविगेशन मेनू',
    'Filtered by role': 'भूमिका अनुसार फ़िल्टर',
    'Showing All': 'सभी उपकरण प्रदर्शित',
    'Show All': 'सभी दिखाएं',
    'Cotton Selling Demo': 'कपास बिक्री डेमो',
    'Step-by-step walkthrough': 'चरण-दर-चरण मार्गदर्शन',
    'Overview Dashboard': 'डैशबोर्ड अवलोकन',
    'Dashboard': 'डैशबोर्ड',
    'Live Crop Prices': 'लाइव फसल भाव',
    'Live Market Prices': 'लाइव मंडी भाव',
    'AI Price Forecast': 'एआई मूल्य पूर्वानुमान ⭐',
    'AI Price Forecasting': 'एआई मूल्य पूर्वानुमान ⭐',
    'Should I Sell Now?': 'क्या मुझे अभी बेचना चाहिए? ⭐',
    'Should I Sell Now? Advisor': 'क्या मुझे अभी बेचना चाहिए? सलाहकार',
    'Should I Sell Now? Advisor →': 'क्या मुझे अभी बेचना चाहिए? सलाहकार →',
    'Sell / Hold Advisor': 'बेचें / रोकें सलाहकार ⭐',
    'My Crops Lifecycle': 'मेरी फसलें और जीवनचक्र',
    'My Crops': 'मेरी फसलें',
    'Weather Intelligence': 'मौसम बुद्धिमत्ता',
    'Weather': 'मौसम',
    'Hire Tractor': 'ट्रैक्टर किराए पर लें 🚜',
    'Tractor Rental': 'ट्रैक्टर किराया 🚜',
    'Book Transport': 'परिवहन बुक करें 🚚',
    'Transport': 'परिवहन 🚚',
    'Hire Farm Equipment': 'कृषि उपकरण किराए पर लें 🛠️',
    'Equipment': 'कृषि उपकरण 🛠️',
    'Storage & Cold Storage': 'कोल्ड स्टोरेज और गोदाम 🏢',
    'Storage Finder': 'कोल्ड स्टोरेज और गोदाम 🏢',
    'AI Machinery Advisor': 'एआई मशीनरी सलाहकार 🤖',
    'Machinery Advisor': 'मशीनरी सलाहकार 🤖',
    'Farmer Crop Market': 'किसान फसल बाजार 🛒',
    'Farmer Marketplace': 'किसान फसल बाजार 🛒',
    'AI Farm Assistant': 'एआई कृषि सहायक 🤖',
    'AI Assistant': 'एआई सहायक 🤖',
    'My Bookings & Rentals': 'मेरी बुकिंग और किराए 📅',
    'My Bookings': 'मेरी बुकिंग 📅',
    'Price Alerts & Watchlist': 'मूल्य अलर्ट और वॉचलिस्ट 🔔',
    'Price Alerts': 'मूल्य अलर्ट 🔔',
    'Payments & Transactions': 'भुगतान और लेनदेन 💳',
    'Transactions': 'लेनदेन 💳',
    'Supply Chain Tracker': 'आपूर्ति श्रृंखला ट्रैकर 🚚',
    'Supply Chain': 'आपूर्ति श्रृंखला 🚚',
    'Reports & Export': 'रिपोर्ट और निर्यात 📄',
    'Reports & Analytics': 'रिपोर्ट और विश्लेषण 📄',
    'Full Admin Console': 'पूर्ण एडमिन कंसोल ⚙️',
    'Admin Console': 'एडमिन कंसोल ⚙️',
    'ML Benchmark & Models': 'एमएल मॉडल प्रदर्शन 🧠',
    'ML Models': 'एमएल मॉडल 🧠',
    'Demand & Supply Gap': 'मांग और आपूर्ति अंतर 📊',
    'Demand & Supply': 'मांग और आपूर्ति 📊',
    'Equipment Guide': 'उपकरण निर्देशिका 🛠️',
    'Farmer Profile': 'किसान प्रोफ़ाइल',
    'Profile Settings': 'प्रोफ़ाइल सेटिंग्स',
    'Core Tools': 'मुख्य कृषि उपकरण',
    'Machinery & Services': 'मशीनरी और सेवाएं',
    'Trade & Account': 'व्यापार और खाता',
    'Fleet Management': 'बेड़ा प्रबंधन',
    'Logistics & Storage': 'लॉजिस्टिक्स और भंडारण',
    'Wholesale Hub': 'थोक खरीद केंद्र',
    'Analytics & AI': 'विश्लेषण और एआई',
    'System Admin': 'सिस्टम व्यवस्थापक',

    // Personas & Roles
    'Farmer': 'किसान',
    'Equipment Owner': 'उपकरण मालिक',
    'Buyer / Trader': 'थोक खरीदार / व्यापारी',
    'Wholesale Buyer': 'थोक खरीदार',
    'Platform Admin': 'प्लेटफॉर्म एडमिन',
    'Guest User': 'अतिथि उपयोगकर्ता',
    'Active Persona': 'सक्रिय भूमिका',
    'Switch Active Persona': 'भूमिका बदलें',
    'Select Persona Console:': 'कंसोल दृश्य चुनें:',
    '🌾 Farmer View': '🌾 किसान दृश्य',
    '🚜 Vehicle & Equipment Owner': '🚜 वाहन एवं उपकरण मालिक',
    '🏬 Buyer / Trader': '🏬 थोक खरीदार / व्यापारी',
    '⚙️ Platform Admin': '⚙️ प्लेटफॉर्म व्यवस्थापक',

    // Forecasting & Advisory
    'Live APMC Market Intelligence': 'लाइव एपीएमसी मंडी भाव बुद्धिमत्ता',
    '15-Day Predictive Horizon': '15-दिवसीय पूर्वानुमानात्मक दृष्टिकोण',
    'Forecast Configuration': 'पूर्वानुमान विन्यास',
    'Select Commodity': 'फसल / कृषि उपज चुनें',
    'Select Crop': 'फसल चुनें',
    'Select Crop:': 'फसल चुनें:',
    'Mandi Market': 'मंडी बाजार',
    'Forecast Period': 'पूर्वानुमान समय सीमा',
    'Model Confidence': 'मॉडल विश्वसनीयता',
    'Expected Price Surge': 'अनुमानित मूल्य वृद्धि',
    'Predicted Modal Price': 'अनुमानित भाव',
    'Predicted Price': 'अनुमानित भाव',
    'Current Mandi Rate': 'वर्तमान मंडी दर',
    'Projected Mandi Rate': 'अनुमानित मंडी भाव',
    'Spot Price': 'वर्तमान हाजिर भाव',
    'Current Spot Price': 'वर्तमान हाजिर भाव',
    'Break-Even Threshold': 'लागत वसूली स्तर (Break-Even)',
    'Break-Even Price': 'लागत वसूली भाव',
    'Net Realized Cash:': 'शुद्ध प्राप्त नकदी:',
    'Net Realized Cash': 'शुद्ध प्राप्त नकदी',
    'Sell Immediately Today': 'आज ही तुरंत बेचें',
    'Store & Sell in': 'भंडारण करें और बेचें:',
    'Store & Sell': 'भंडारण करें और बेचें',
    'Gross Mandi Realization': 'कुल मंडी आय',
    'Mandi Transport & Handling Cost': 'मंडी परिवहन और हैंडलिंग लागत',
    'Storage Costs Incurred': 'भंडारण लागत',
    'Cold Storage Fees': 'कोल्ड स्टोरेज शुल्क',
    'Option A (Spot Sale) vs Option B (Storage & Hold)': 'विकल्प A (हाजिर बिक्री) बनाम विकल्प B (भंडारण और होल्ड)',
    'Option A': 'विकल्प A',
    'Option B': 'विकल्प B',
    'RECOMMENDED': 'अनुशंसित (सुझाव)',
    'Practical Farmer Guidance:': 'व्यावहारिक किसान सलाह:',
    'Safe by': 'सुरक्षित मार्जिन:',
    'Shortfall of': 'कमी:',
    'Total Net Gain': 'कुल शुद्ध लाभ',
    'Total Net Loss': 'कुल शुद्ध हानि',
    'Net Profit Margin': 'शुद्ध लाभ मार्जिन',
    'Recommendation': 'सिफारिश',
    'RECOMMENDED: HOLD': 'सुझाव: रोककर रखें',
    'RECOMMENDED: SELL NOW': 'सुझाव: अभी बेचें',
    'Hold Produce': 'उपज रोककर रखें',
    'Sell Today': 'आज ही बेचें',

    // Crops
    'Cotton (Kapas)': 'कपास (Cotton)',
    'Cotton': 'कपास',
    'Soybean (Yellow)': 'सोयाबीन (Soybean)',
    'Soybean': 'सोयाबीन',
    'Wheat (Lokwan)': 'गेहूं (लोकवन)',
    'Wheat': 'गेहूं',
    'Paddy (Dhan)': 'धान (चावल)',
    'Paddy': 'धान / चावल',
    'Chana (Bengal Gram)': 'चना (Chana)',
    'Chana': 'चना',
    'Gram': 'चना',
    'Tur (Pigeon Pea)': 'तुअर / अरहर (Tur)',
    'Tur': 'तुअर / अरहर',
    'Moong (Green Gram)': 'मूंग (Moong)',
    'Moong': 'मूंग',
    'Urad (Black Gram)': 'उड़द (Urad)',
    'Urad': 'उड़द',
    'Maize (Corn)': 'मक्का (Maize)',
    'Maize': 'मक्का',
    'Mustard (Sarson)': 'सरसों (Mustard)',
    'Mustard': 'सरसों',
    'Onion (Nashik)': 'प्याज (Onion)',
    'Onion': 'प्याज',
    'Potato (Agra)': 'आलू (Potato)',
    'Potato': 'आलू',
    'Tomato (Hybrid)': 'टमाटर (Tomato)',
    'Tomato': 'टमाटर',
    'Green Chilli': 'हरी मिर्च',
    'Ginger': 'अदरक',
    'Garlic': 'लहसुन',
    'Sugarcane': 'गन्ना',
    'Bajra': 'बाजरा',
    'Jowar': 'ज्वार',
    'Groundnut': 'मूंगफली',

    // Common UI & Actions
    'Search': 'खोजें',
    'Filter': 'फ़िल्टर',
    'Book Now': 'अभी बुक करें',
    'Hire Now': 'किराए पर लें',
    'Confirm Booking': 'बुकिंग की पुष्टि करें',
    'Add Crop': 'नई फसल जोड़ें',
    'Register Crop': 'फसल पंजीकृत करें',
    'Refresh Data': 'डेटा रीफ्रेश करें',
    'Syncing...': 'सिंक हो रहा है...',
    'Live (Agmarknet)': '🟢 लाइव (अगमार्कनेट)',
    'Cached': '🟡 कैश्ड डेटा',
    'Save': 'सहेजें',
    'Cancel': 'रद्द करें',
    'Close': 'बंद करें',
    'Submit': 'जमा करें',
    'Delete': 'हटाएं',
    'Edit': 'संपादित करें',
    'View Details': 'विवरण देखें',
    'Back': 'पीछे',
    'Next': 'आगे',
    'Confirm': 'पुष्टि करें',
    'Download': 'डाउनलोड करें',
    'Export': 'निर्यात करें',
    'Print': 'प्रिंट करें',
    'Sign In': 'लॉग इन करें',
    'Log In': 'लॉग इन करें',
    'Sign Out': 'साइन आउट',
    'Logout': 'लॉग आउट',
    'Create Account': 'नया खाता बनाएं',
    'Good Morning': 'शुभ प्रभात',
    'Welcome back': 'वापसी पर स्वागत है',

    // Units & Metrics
    'Quintal': 'कुंतल',
    'Quintals': 'कुंतल',
    '/ Quintal': '/ कुंतल',
    '/ qtl': '/ कुंतल',
    '/ Hour': '/ घंटा',
    '/ Day': '/ दिन',
    '/ km': '/ किमी',
    'Acre': 'एकड़',
    'Acres': 'एकड़',
    'HP Category': 'एचपी श्रेणी',
    'Tractor Brand': 'ट्रैक्टर ब्रांड',
    'Driver Included': 'ड्राइवर सहित',
    'Fuel Included': 'ईंधन सहित',
    'Status': 'स्थिति',
    'Available': 'उपलब्ध',
    'Available Now': 'अभी उपलब्ध',
    'Booked': 'बुक किया गया',
    'Confirmed': 'पुष्टीकृत',
    'Pending': 'लंबित',
    'Completed': 'पूर्ण',
    'Active': 'सक्रिय',
    'Modal Price': 'भाव',
    'Price': 'भाव',
    'MIN PRICE': 'न्यूनतम भाव',
    'MAX PRICE': 'अधिकतम भाव',
    'Min Price': 'न्यूनतम भाव',
    'Max Price': 'अधिकतम भाव',
    'Updated': 'अद्यतित',
    'Source': 'स्रोत',
    'Date': 'तारीख',
    'Time': 'समय',
    'Total Amount': 'कुल राशि',
    'Payment Status': 'भुगतान स्थिति',
    'Days': 'दिन',
    'days': 'दिन',
    'Day': 'दिन'
  },

  mr: {
    // Navigation & Shell
    'AgriPulse AI': 'अ‍ॅग्रीपल्स एआय',
    'AgriPulse AI 2.0': 'अ‍ॅग्रीपल्स एआय २.०',
    'Navigation Menu': 'नेव्हिगेशन मेनू',
    'Filtered by role': 'भूमिकेनुसार फिल्टर',
    'Showing All': 'सर्व साधने दाखवत आहे',
    'Show All': 'सर्व पहा',
    'Cotton Selling Demo': 'कापूस विक्री प्रात्यक्षिक',
    'Step-by-step walkthrough': 'टप्प्याटप्प्याने मार्गदर्शन',
    'Overview Dashboard': 'डॅशबोर्ड विहंगावलोकन',
    'Dashboard': 'डॅशबोर्ड',
    'Live Crop Prices': 'थेट पीक भाव',
    'Live Market Prices': 'थेट बाजार भाव',
    'AI Price Forecast': 'एआय भाव अंदाज ⭐',
    'AI Price Forecasting': 'एआय भाव अंदाज ⭐',
    'Should I Sell Now?': 'मी आता विकावे का? ⭐',
    'Should I Sell Now? Advisor': 'मी आता विकावे का? सल्लागार',
    'Should I Sell Now? Advisor →': 'मी आता विकावे का? सल्लागार →',
    'Sell / Hold Advisor': 'विक्री किंवा साठा सल्लागार ⭐',
    'My Crops Lifecycle': 'माझी पिके आणि जीवनचक्र',
    'My Crops': 'माझी पिके',
    'Weather Intelligence': 'हवामान अंदाज व बुद्धिमत्ता',
    'Weather': 'हवामान',
    'Hire Tractor': 'ट्रॅक्टर भाड्याने घ्या 🚜',
    'Tractor Rental': 'ट्रॅक्टर भाडे 🚜',
    'Book Transport': 'वाहतूक बुक करा 🚚',
    'Transport': 'वाहतूक 🚚',
    'Hire Farm Equipment': 'शेती अवजारे भाड्याने घ्या 🛠️',
    'Equipment': 'शेती अवजारे 🛠️',
    'Storage & Cold Storage': 'कोल्ड स्टोरेज आणि गोदामे 🏢',
    'Storage Finder': 'कोल्ड स्टोरेज आणि गोदामे 🏢',
    'AI Machinery Advisor': 'एआय यंत्रसामग्री सल्लागार 🤖',
    'Machinery Advisor': 'यंत्रसामग्री सल्लागार 🤖',
    'Farmer Crop Market': 'शेतकरी पीक बाजार 🛒',
    'Farmer Marketplace': 'शेतकरी पीक बाजार 🛒',
    'AI Farm Assistant': 'एआय शेती सहाय्यक 🤖',
    'AI Assistant': 'एआय सहाय्यक 🤖',
    'My Bookings & Rentals': 'माझ्या बुकिंग आणि भाडे 📅',
    'My Bookings': 'माझ्या बुकिंग 📅',
    'Price Alerts & Watchlist': 'भाव सूचना आणि वॉचलिस्ट 🔔',
    'Price Alerts': 'भाव सूचना 🔔',
    'Payments & Transactions': 'पैसे व्यवहार आणि नोंदी 💳',
    'Transactions': 'पैसे व्यवहार 💳',
    'Supply Chain Tracker': 'पुरवठा साखळी ट्रॅकर 🚚',
    'Supply Chain': 'पुरवठा साखळी 🚚',
    'Reports & Export': 'अहवाल आणि निर्यात 📄',
    'Reports & Analytics': 'अहवाल आणि विश्लेषण 📄',
    'Full Admin Console': 'पूर्ण अ‍ॅडमिन कंसोल ⚙️',
    'Admin Console': 'अ‍ॅडमिन कंसोल ⚙️',
    'ML Benchmark & Models': 'एमएल मॉडेल कामगिरी 🧠',
    'ML Models': 'एमएल मॉडेल 🧠',
    'Demand & Supply Gap': 'मागणी आणि पुरवठा फरक 📊',
    'Demand & Supply': 'मागणी आणि पुरवठा 📊',
    'Equipment Guide': 'अवजारे मार्गदर्शक 🛠️',
    'Farmer Profile': 'शेतकरी प्रोफाइल',
    'Profile Settings': 'प्रोफाइल सेटिंग्ज',
    'Core Tools': 'मुख्य कृषी साधने',
    'Machinery & Services': 'यंत्रसामग्री आणि सेवा',
    'Trade & Account': 'व्यापार आणि खाते',
    'Fleet Management': 'ताफा व्यवस्थापन',
    'Logistics & Storage': 'लॉजिस्टिक्स आणि साठवणूक',
    'Wholesale Hub': 'घाऊक खरेदी केंद्र',
    'Analytics & AI': 'विश्लेषण आणि एआय',
    'System Admin': 'प्रशासक',

    // Personas & Roles
    'Farmer': 'शेतकरी',
    'Equipment Owner': 'यंत्रसामग्री मालक',
    'Buyer / Trader': 'घाऊक खरेदीदार / व्यापारी',
    'Wholesale Buyer': 'घाऊक खरेदीदार',
    'Platform Admin': 'प्लॅटफॉर्म अ‍ॅडमिन',
    'Guest User': 'अतिथी वापरकर्ता',
    'Active Persona': 'सक्रिय भूमिका',
    'Switch Active Persona': 'भूमिका बदला',
    'Select Persona Console:': 'कंसोल दृश्य निवडा:',
    '🌾 Farmer View': '🌾 शेतकरी दृश्य',
    '🚜 Vehicle & Equipment Owner': '🚜 यंत्रसामग्री व वाहन मालक',
    '🏬 Buyer / Trader': '🏬 घाऊक खरेदीदार / व्यापारी',
    '⚙️ Platform Admin': '⚙️ प्लॅटफॉर्म प्रशासक',

    // Forecasting & Advisory
    'Live APMC Market Intelligence': 'थेट बाजार समिती भाव माहिती',
    '15-Day Predictive Horizon': '१५-दिवसीय अंदाज दृष्टिकोन',
    'Forecast Configuration': 'अंदाज संरचना व पर्याय',
    'Select Commodity': 'पीक / कृषी उत्पादन निवडा',
    'Select Crop': 'पीक निवडा',
    'Select Crop:': 'पीक निवडा:',
    'Mandi Market': 'बाजार समिती',
    'Forecast Period': 'अंदाज कालावधी',
    'Model Confidence': 'मॉडेल विश्वासार्हता',
    'Expected Price Surge': 'अपेक्षित भाव वाढ',
    'Predicted Modal Price': 'अंदाजित दर',
    'Predicted Price': 'अंदाजित दर',
    'Current Mandi Rate': 'सध्याचा बाजार दर',
    'Projected Mandi Rate': 'अंदाजित बाजार भाव',
    'Spot Price': 'चालू बाजार भाव',
    'Current Spot Price': 'सध्याचा चालू भाव',
    'Break-Even Threshold': 'खर्च भरपाई स्तर (Break-Even)',
    'Break-Even Price': 'खर्च भरपाई भाव',
    'Net Realized Cash:': 'निव्वळ मिळालेली रक्कम:',
    'Net Realized Cash': 'निव्वळ मिळालेली रक्कम',
    'Sell Immediately Today': 'आजच त्वरित विका',
    'Store & Sell in': 'साठवणूक करा आणि विका:',
    'Store & Sell': 'साठवून विका',
    'Gross Mandi Realization': 'एकूण बाजार उत्पन्न',
    'Mandi Transport & Handling Cost': 'वाहतूक व हमाली खर्च',
    'Storage Costs Incurred': 'साठवणूक खर्च',
    'Cold Storage Fees': 'कोल्ड स्टोरेज भाडे',
    'Option A (Spot Sale) vs Option B (Storage & Hold)': 'पर्याय A (थेट विक्री) विरुद्ध पर्याय B (साठवणूक व थांबा)',
    'Option A': 'पर्याय A',
    'Option B': 'पर्याय B',
    'RECOMMENDED': 'शिफारस केलेले',
    'Practical Farmer Guidance:': 'व्यावहारिक शेतकरी मार्गदर्शन:',
    'Safe by': 'सुरक्षित मार्जिन:',
    'Shortfall of': 'तूट:',
    'Total Net Gain': 'एकूण निव्वळ नफा',
    'Total Net Loss': 'एकूण तोटा',
    'Net Profit Margin': 'निव्वळ नफा मार्जिन',
    'Recommendation': 'सल्ला',
    'RECOMMENDED: HOLD': 'सल्ला: साठवून ठेवा',
    'RECOMMENDED: SELL NOW': 'सल्ला: आत्ताच विका',
    'Hold Produce': 'माल साठवून ठेवा',
    'Sell Today': 'आजच विका',

    // Crops
    'Cotton (Kapas)': 'कापूस (Cotton)',
    'Cotton': 'कापूस',
    'Soybean (Yellow)': 'सोयाबीन (Soybean)',
    'Soybean': 'सोयाबीन',
    'Wheat (Lokwan)': 'गहू (लोकवन)',
    'Wheat': 'गहू',
    'Paddy (Dhan)': 'भात / धान (Paddy)',
    'Paddy': 'भात / धान',
    'Chana (Bengal Gram)': 'हरभरा / चणा (Gram)',
    'Chana': 'हरभरा',
    'Gram': 'हरभरा',
    'Tur (Pigeon Pea)': 'तूर (Tur)',
    'Tur': 'तूर',
    'Moong (Green Gram)': 'मूग (Moong)',
    'Moong': 'मूग',
    'Urad (Black Gram)': 'उडीद (Urad)',
    'Urad': 'उडीद',
    'Maize (Corn)': 'मका (Maize)',
    'Maize': 'मका',
    'Mustard (Sarson)': 'मोहरी (Mustard)',
    'Mustard': 'मोहरी',
    'Onion (Nashik)': 'कांदा (Onion)',
    'Onion': 'कांदा',
    'Potato (Agra)': 'बटाटा (Potato)',
    'Potato': 'बटाटा',
    'Tomato (Hybrid)': 'टोमॅटो (Tomato)',
    'Tomato': 'टोमॅटो',
    'Green Chilli': 'हिरवी मिरची',
    'Ginger': 'आले',
    'Garlic': 'लसूण',
    'Sugarcane': 'ऊस',
    'Bajra': 'बाजरी',
    'Jowar': 'ज्वारी',
    'Groundnut': 'भुईमूग',

    // Common UI & Actions
    'Search': 'शोधा',
    'Filter': 'फिल्टर',
    'Book Now': 'आत्ताच बुक करा',
    'Hire Now': 'भाड्याने घ्या',
    'Confirm Booking': 'बुकिंग निश्चित करा',
    'Add Crop': 'नवीन पीक जोडा',
    'Register Crop': 'पीक नोंदणी करा',
    'Refresh Data': 'डेटा ताजी करा',
    'Syncing...': 'सिंक होत आहे...',
    'Live (Agmarknet)': '🟢 थेट (अगमार्कनेट)',
    'Cached': '🟡 कॅश केलेला डेटा',
    'Save': 'जतन करा',
    'Cancel': 'रद्द करा',
    'Close': 'बंद करा',
    'Submit': 'सादर करा',
    'Delete': 'हटवा',
    'Edit': 'संपादित करा',
    'View Details': 'तपशील पहा',
    'Back': 'मागे',
    'Next': 'पुढे',
    'Confirm': 'निश्चित करा',
    'Download': 'डाउनलोड करा',
    'Export': 'निर्यात करा',
    'Print': 'प्रिंट करा',
    'Sign In': 'साइन इन करा',
    'Log In': 'लॉग इन करा',
    'Sign Out': 'साइन आउट करा',
    'Logout': 'लॉग आऊट',
    'Create Account': 'नवीन खाते तयार करा',
    'Good Morning': 'शुभ सकाळ',
    'Welcome back': 'पुन्हा स्वागत आहे',

    // Units & Metrics
    'Quintal': 'क्विंटल',
    'Quintals': 'क्विंटल',
    '/ Quintal': '/ क्विंटल',
    '/ qtl': '/ क्विंटल',
    '/ Hour': '/ तास',
    '/ Day': '/ दिवस',
    '/ km': '/ किमी',
    'Acre': 'एकर',
    'Acres': 'एकर',
    'HP Category': 'एचपी वर्ग',
    'Tractor Brand': 'ट्रॅक्टर ब्रँड',
    'Driver Included': 'चालकासह',
    'Fuel Included': 'इंधनासह',
    'Status': 'स्थिती',
    'Available': 'उपलब्ध',
    'Available Now': 'आत्ता उपलब्ध',
    'Booked': 'बुक केलेले',
    'Confirmed': 'निश्चित केलेले',
    'Pending': 'प्रलंबित',
    'Completed': 'पूर्ण',
    'Active': 'सक्रिय',
    'Modal Price': 'दर',
    'Price': 'दर',
    'MIN PRICE': 'किमान दर',
    'MAX PRICE': 'कमाल दर',
    'Min Price': 'किमान दर',
    'Max Price': 'कमाल दर',
    'Updated': 'अपडेट केले',
    'Source': 'स्रोत',
    'Date': 'तारीख',
    'Time': 'वेळ',
    'Total Amount': 'एकूण रक्कम',
    'Payment Status': 'पेमेंट स्थिती',
    'Days': 'दिवस',
    'days': 'दिवस',
    'Day': 'दिवस'
  }
};

// Pre-sorted phrases by length descending to greedily replace longer phrases first
const sortedPhrases = {
  hi: Object.keys(DICTIONARY.hi).sort((a, b) => b.length - a.length),
  mr: Object.keys(DICTIONARY.mr).sort((a, b) => b.length - a.length)
};

/**
 * Translate a piece of text using the dictionary
 */
export function translateText(text, lang) {
  if (!text || lang === 'en') return text;
  const dict = DICTIONARY[lang];
  if (!dict) return text;

  const trimmed = text.trim();
  if (dict[trimmed]) {
    // Preserve leading/trailing spaces
    const prefix = text.match(/^\s*/)[0];
    const suffix = text.match(/\s*$/)[0];
    return prefix + dict[trimmed] + suffix;
  }

  // Multi-phrase replacement
  let result = text;
  const phrases = sortedPhrases[lang];
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    if (result.includes(p)) {
      result = result.split(p).join(dict[p]);
    }
  }
  return result;
}

let currentLanguage = 'en';
let isTranslating = false;
let observer = null;

// React 18 Google Translate Dom reconciliation fix
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return originalInsertBefore.call(this, newNode, null);
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

/**
 * Apply translation recursively to a DOM node and its descendants
 */
function translateNode(node, lang) {
  if (!node) return;

  // Ignore script, style, code, pre, svg, or elements marked with translate="no" or notranslate
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.getAttribute && (node.getAttribute('translate') === 'no' || (node.classList && node.classList.contains('notranslate')))) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre' || tag === 'svg' || node.id === 'google_translate_element') {
      return;
    }

    // Translate placeholder on inputs/textareas
    if (tag === 'input' || tag === 'textarea') {
      if (node.placeholder) {
        if (!node._agriOrigPlaceholder) {
          node._agriOrigPlaceholder = node.placeholder;
        }
        if (lang === 'en') {
          node.placeholder = node._agriOrigPlaceholder;
        } else {
          node.placeholder = translateText(node._agriOrigPlaceholder, lang);
        }
      }
    }
  }

  // Text Node
  if (node.nodeType === Node.TEXT_NODE) {
    // Check if parent has translate="no" or class notranslate
    if (node.parentElement && (node.parentElement.getAttribute('translate') === 'no' || node.parentElement.classList.contains('notranslate'))) {
      return;
    }

    const val = node.nodeValue;
    if (!val || !val.trim()) return;

    if (!node._agriOrigText) {
      node._agriOrigText = val;
    }

    if (lang === 'en') {
      if (node.nodeValue !== node._agriOrigText) {
        node.nodeValue = node._agriOrigText;
      }
    } else {
      const translated = translateText(node._agriOrigText, lang);
      if (translated !== node.nodeValue) {
        node.nodeValue = translated;
      }
    }
    return;
  }

  // Recurse child nodes
  let child = node.firstChild;
  while (child) {
    translateNode(child, lang);
    child = child.nextSibling;
  }
}

/**
 * Clear any conflicting external googtrans cookie so proper nouns like personal names are not mutated
 */
function syncGoogleTranslate(lang) {
  try {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    const host = window.location.hostname;
    if (host) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
    }
  } catch (err) {
    console.debug('Google Translate sync:', err.message);
  }
}

/**
 * Public method: Trigger full DOM translation across all pages, options, and features
 */
export function setAppLanguage(newLang) {
  currentLanguage = newLang || 'en';

  if (typeof document === 'undefined') return;

  isTranslating = true;
  try {
    // 1. Instant client-side DOM translation
    translateNode(document.body, currentLanguage);

    // 2. Sync Google Translate widget
    syncGoogleTranslate(currentLanguage);
  } finally {
    isTranslating = false;
  }
}

/**
 * Initialize auto-translation observer on the document body
 */
export function initAutoTranslator(getLanguageFn) {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

  currentLanguage = (getLanguageFn && getLanguageFn()) || localStorage.getItem('agri_language') || 'en';

  // Translate initially
  setTimeout(() => {
    setAppLanguage(currentLanguage);
  }, 100);

  if (observer) {
    observer.disconnect();
  }

  let debounceTimer = null;

  observer = new MutationObserver((mutations) => {
    if (isTranslating || currentLanguage === 'en') return;

    let hasRelevantChange = false;
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        hasRelevantChange = true;
        break;
      }
    }

    if (hasRelevantChange) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (currentLanguage !== 'en') {
          isTranslating = true;
          try {
            translateNode(document.body, currentLanguage);
          } finally {
            isTranslating = false;
          }
        }
      }, 50);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
