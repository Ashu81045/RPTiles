/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi' | 'hinglish';

export interface TranslationDict {
  // Navigation / Headers
  digitalShowroom: string;
  tilingStudio: string;
  warehouseInventory: string;
  posBilling: string;
  customerLedger: string;
  appTitle: string;
  adminTitle: string;
  resetDefaults: string;
  connectPhone: string;
  logOut: string;
  publicSite: string;
  adminLogin: string;
  accessPos: string;

  // Common tags / terms
  gstTax: string;
  rupees: string;
  sqftUnit: string;
  pcsUnit: string;
  boxUnit: string;
  finish: string;
  material: string;
  size: string;
  price: string;
  stock: string;
  minStock: string;
  skuCode: string;
  category: string;
  activeStatus: string;
  actions: string;
  total: string;
  save: string;
  cancel: string;
  delete: string;
  add: string;
  search: string;

  // Billing Module (Part Payment & SPLIT options!)
  grahakDetails: string;
  grahakName: string;
  grahakPhone: string;
  grahakAddress: string;
  billingCart: string;
  emptyCart: string;
  discountRate: string;
  gstRate: string;
  loadingCharges: string;
  labourCharges: string;
  otherCharges: string;
  chargesReason: string;
  paymentType: string;
  paymentTypeDescription: string;
  receivePartPayment: string;
  receivePartPaymentDesc: string;
  fullyPaidBtn: string;
  partPaidBtn: string;
  allDueBtn: string;
  paidAmountLabel: string;
  remainingDueLabel: string;
  subtotalLabel: string;
  grandTotalLabel: string;
  createBillBtn: string;
  clearDueBtn: string;
  quickAddBtn: string;
  customPriceLabel: string;
  customDiscountLabel: string;
  remarksLabel: string;

  // Billing Receipt / Invoice
  taxInvoiceHeader: string;
  authorisedSignatory: string;
  walkInCustomer: string;
  invoiceNo: string;
  dateLabel: string;
  totalReceived: string;
  totalBalanceDue: string;
  printBillBtn: string;
  whatsappBillBtn: string;
  closeBillBtn: string;

  // Customer Ledger Book (Khata)
  khataBookHeading: string;
  khataBookDesc: string;
  totalCustomers: string;
  totalOutstanding: string;
  lastPaymentDate: string;
  addPaymentBtn: string;
  settlementLabel: string;
  addDueBtn: string;
  historyLedger: string;
  particulars: string;
  debitMinus: string;
  creditPlus: string;
  outstandingBalance: string;
  statusCleared: string;
  statusDue: string;
  recordPaymentModal: string;
  paymentRemarksPlaceholder: string;

  // Landing Page Showroom
  heroTitle1: string;
  heroTitle2: string;
  heroSub: string;
  browseGallery: string;
  activeShowcase: string;
  tryTilingBtn: string;
  quickInquiry: string;
  reserveShowroom: string;
  reserveSub: string;
  yourName: string;
  yourPhone: string;
  yourEmail: string;
  yourMessage: string;
  bookSuccess: string;
  bookSuccessSub: string;
  dispatchBtn: string;

  // Admin Login Screen
  consoleLogin: string;
  emailLabel: string;
  passLabel: string;
  authCredentials: string;
  establishSession: string;
  backToShowroom: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    digitalShowroom: "Digital Showroom",
    tilingStudio: "Interactive Tiling Studio",
    warehouseInventory: "Warehouse Inventory Console",
    posBilling: "POS Billing Desk",
    customerLedger: "Customer Ledger & Outstanding Book",
    appTitle: "RP Tiles Luxury Depot",
    adminTitle: "Administrative Panel Console",
    resetDefaults: "Reset Defaults",
    connectPhone: "Connect Phone",
    logOut: "Log Out",
    publicSite: "Public Site",
    adminLogin: "Admin Login",
    accessPos: "Access POS",

    gstTax: "GST (18%)",
    rupees: "₹",
    sqftUnit: "sqft",
    pcsUnit: "pcs",
    boxUnit: "box",
    finish: "Finish",
    material: "Material",
    size: "Size",
    price: "Price",
    stock: "Stock",
    minStock: "Min Stock",
    skuCode: "SKU Code",
    category: "Category",
    activeStatus: "Status",
    actions: "Actions",
    total: "Total",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    add: "Add Product",
    search: "Search...",

    grahakDetails: "Client / Grahak Details",
    grahakName: "Customer Name",
    grahakPhone: "Customer Phone No.",
    grahakAddress: "Site Delivery Address",
    billingCart: "Your Billing Cart",
    emptyCart: "Cart is empty. Select tiles from the left panel.",
    discountRate: "Cash Discount (%)",
    gstRate: "GST / CGST Tax Rate (%)",
    loadingCharges: "Loading / Gaddi Labour (₹)",
    labourCharges: "Fitting/Labour Aid (₹)",
    otherCharges: "Other Freight / Extras (₹)",
    chargesReason: "Extra Charges Description",
    paymentType: "Payment Method",
    paymentTypeDescription: "Select primary system channel used",
    receivePartPayment: "Payment Terms (Part Payment / Udhaar Option)",
    receivePartPaymentDesc: "Choose if customer is paying in full, part payment, or on full credit (Udhaar).",
    fullyPaidBtn: "Full Paid (100%)",
    partPaidBtn: "Part Paid (Split Dues)",
    allDueBtn: "Full Udhaar (0% Paid)",
    paidAmountLabel: "Customer Paid (Jama) Amount (₹)",
    remainingDueLabel: "Remaining Due (Udhaar) (₹)",
    subtotalLabel: "Subtotal Amount",
    grandTotalLabel: "Grand Total (Net Bill)",
    createBillBtn: "Generate & Record Bill",
    clearDueBtn: "Clear Dues",
    quickAddBtn: "Add to Cart",
    customPriceLabel: "Special Negotiated Price (₹)",
    customDiscountLabel: "Line Discount (%)",
    remarksLabel: "Dispatch/Batch Remarks",

    taxInvoiceHeader: "TAX INVOICE / CASH BILL / KHATA ESTIMATE",
    authorisedSignatory: "Authorised Hand Sign",
    walkInCustomer: "Valued Walk-In Grahak",
    invoiceNo: "Bill Invoice No.",
    dateLabel: "Billing Date",
    totalReceived: "Total Received (Jama)",
    totalBalanceDue: "Balance Due (Baqaya / Udhaar)",
    printBillBtn: "Print Receipt / Tax Paper",
    whatsappBillBtn: "Send Bill on WhatsApp",
    closeBillBtn: "Close Bill",

    khataBookHeading: "Customer Ledger (Khata Book)",
    khataBookDesc: "Trace real-time outstanding balances, ledger debits, client payments, and send cash reminders.",
    totalCustomers: "Total Registered Grahaks",
    totalOutstanding: "Total Showroom Outstanding Dues",
    lastPaymentDate: "Last Transaction History",
    addPaymentBtn: "Jama Karein (Add Cash)",
    settlementLabel: "Settle / Recieve Online",
    addDueBtn: "Add Manual Udhaar",
    historyLedger: "Customer Khata Ledger History",
    particulars: "Particulars / Remarks",
    debitMinus: "Showroom Debit (Products / Dues +)",
    creditPlus: "Customer Paid (Jama / Cash Received -)",
    outstandingBalance: "Baqaya balance",
    statusCleared: "Cleared",
    statusDue: "Dues Pending",
    recordPaymentModal: "Record Khata Payment Entry",
    paymentRemarksPlaceholder: "Provide description (e.g. Cleared dues via cash post tiles delivery)...",

    heroTitle1: "Sophisticated Surfaces",
    heroTitle2: "Crafted for Posterity.",
    heroSub: "RP Tiles formulated premium vitrified tiling, custom marbles and elegant fittings. Use our 3D Interactive Studio to configure layouts visually of any tile size on the spot.",
    browseGallery: "Browse Signature Gallery",
    activeShowcase: "Active Showroom Showcase",
    tryTilingBtn: "Try in Room Simulator",
    quickInquiry: "Quick Whatsapp Inquiry",
    reserveShowroom: "Reserve Showroom Visit",
    reserveSub: "Plan your layout appointment or custom heavy trucking estimate. Fill out our corporate reserve channel and our material engineers will reach back within three business hours.",
    yourName: "Your Full Name",
    yourPhone: "Mobile / Phone No.",
    yourEmail: "Email (For Quote PDF)",
    yourMessage: "Message / Product Batch Scaling Details",
    bookSuccess: "Consultation Booked Successfully!",
    bookSuccessSub: "Your showroom slot has been saved. Our site engineers will contact you shortly with batch samples.",
    dispatchBtn: "Book Showroom Appointment",

    consoleLogin: "Admin Console Login",
    emailLabel: "Administrative Email Id",
    passLabel: "Access Security Password",
    authCredentials: "Authorized Demo Access Credentials:",
    establishSession: "Establish Admin Session",
    backToShowroom: "Back to Public Showroom"
  },
  hi: {
    digitalShowroom: "शोरूम कैटलॉग",
    tilingStudio: "टाइलिंग सिमुलेटर",
    warehouseInventory: "गोदाम माल सूची",
    posBilling: "नया बिल काउंटर",
    customerLedger: "खाता बुक (उधारी बही)",
    appTitle: "आर.पी. टाइल्स लग्जरी डिपो",
    adminTitle: "प्रशासनिक पैनल डैशबोर्ड",
    resetDefaults: "रीसेट करें",
    connectPhone: "फ़ोन कनेक्ट",
    logOut: "लॉग आउट",
    publicSite: "वेबसाइट देखें",
    adminLogin: "व्यवस्थापक लॉगिन",
    accessPos: "बिल काउंटर पर जाएं",

    gstTax: "जीएसटी (18% टैक्स)",
    rupees: "₹",
    sqftUnit: "वर्ग फुट",
    pcsUnit: "पीस",
    boxUnit: "बॉक्स",
    finish: "फिनिश",
    material: "सामग्री",
    size: "साइज",
    price: "कीमत",
    stock: "स्टाक",
    minStock: "कम से कम स्टाक",
    skuCode: "एसकेयू कोड",
    category: "श्रेणी",
    activeStatus: "स्थिति",
    actions: "कार्रवाई",
    total: "कुल",
    save: "सुरक्षित करें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    add: "नया आइटम डालें",
    search: "खोजें...",

    grahakDetails: "ग्राहक का विवरण (Grahak Details)",
    grahakName: "ग्राहक का नाम",
    grahakPhone: "फ़ोन नंबर",
    grahakAddress: "साइड डिलेवरी का पता",
    billingCart: "बिलिंग कार्ट (सामान सूची)",
    emptyCart: "कार्ट खाली है। बाईं पैनल से टाइल्स चुनें।",
    discountRate: "नकद छूट (%) (Discount)",
    gstRate: "जीएसटी टैक्स दर (%) (GST)",
    loadingCharges: "लोडिंग व गाड़ी मजदूरी (₹)",
    labourCharges: "फिटिंग सहायता / कारीगरी (₹)",
    otherCharges: "अन्य भाड़ा व किराया (₹)",
    chargesReason: "अतिरिक्त खर्च का विवरण",
    paymentType: "भुगतान का प्रकार",
    paymentTypeDescription: "भुगतान कैसे मिला?",
    receivePartPayment: "उधारी व भुगतान की शर्तें (Part Payment Options)",
    receivePartPaymentDesc: "चुनें कि ग्राहक पूरा भुगतान कर रहा है, आंशिक कर रहा है या फुल उधारी है।",
    fullyPaidBtn: "पूरा नकद (100% जमा)",
    partPaidBtn: "आंशिक भुगतान (कुछ नकद + कुछ उधार)",
    allDueBtn: "पूरा उधारी (100% उधार / खाता)",
    paidAmountLabel: "ग्राहक जमा राशि (Paid Amount) (₹)",
    remainingDueLabel: "शेष उधारी रकम (Remaining Due) (₹)",
    subtotalLabel: "कुल योग (बिना टैक्स)",
    grandTotalLabel: "अंतिम देय राशि (Net bill)",
    createBillBtn: "बिल बनाएं और खाता दर्ज करें",
    clearDueBtn: "उधार क्लियर करें",
    quickAddBtn: "कार्ट में जोड़ें",
    customPriceLabel: "विशेष तय कीमत (₹)",
    customDiscountLabel: "सामान पर खास छूट (%)",
    remarksLabel: "बैच / शिपमेंट रिमार्क",

    taxInvoiceHeader: "टैक्स इनवॉइस / पक्का जीएसटी बिल / खाता एस्टीमेट",
    authorisedSignatory: "अधिकृत हस्ताक्षर",
    walkInCustomer: "काउंटर ग्राहक (Walk-In)",
    invoiceNo: "पक्का बिल नंबर",
    dateLabel: "बिलिंग तिथि",
    totalReceived: "प्राप्त जमा राशि (Received)",
    totalBalanceDue: "शेष उधार राशि (Balance Due/Udhaar)",
    printBillBtn: "पक्का बिल प्रिंट करें",
    whatsappBillBtn: "व्हाट्सएप पर बिल भेजें",
    closeBillBtn: "बिल बंद करें",

    khataBookHeading: "ग्राहक खाता बही (Khata Book)",
    khataBookDesc: "यहां वास्तविक समय में बकाया राशि, खाता जमा-निकासी, ग्राहकों की उधारी और भुगतान ट्रैक करें।",
    totalCustomers: "कुल पंजीकृत ग्राहक",
    totalOutstanding: "शो-रूम की कुल बकाया उधारी",
    lastPaymentDate: "आखिरी लेन-देन इतिहास",
    addPaymentBtn: "खाता जमा करें (Add Cash)",
    settlementLabel: "जमा / ऑनलाइन रसीद",
    addDueBtn: "मैन्युअल उधार जोड़ें",
    historyLedger: "ग्राहक खाता बही विवरण इतिहास (Ledger)",
    particulars: "विवरण / रिमार्क्स",
    debitMinus: "शो-रूम उधारी नामे (Debit / Products +)",
    creditPlus: "ग्राहक जमा क्रेडिट (Credit / Cash -)",
    outstandingBalance: "शेष बकाया बैलेंस",
    statusCleared: "चुक्ता (Cleared)",
    statusDue: "उधारी लंबित",
    recordPaymentModal: "नया खाता जमा एंट्री दर्ज करें",
    paymentRemarksPlaceholder: "विवरण लिखें (जैसे- टाइल्स डिलीवरी के बाद कैश द्वारा बकाया भुगतान मिला)...",

    heroTitle1: "सुंदर और मजबूत टाइल्स",
    heroTitle2: "मकान बने हमेशा के लिए।",
    heroSub: "आर.पी. टाइल्स पर पाएं सबसे बेहतरीन विट्रिफाइड टाइल्स, मार्वल और शानदार फिटिंग्स। टाइल साइज को तुरंत बिछा कर चेक करने के लिए हमारे 3D सिमुलेटर का प्रयोग करें।",
    browseGallery: "गैलरी देखें",
    activeShowcase: "हमारे शो-रूम के बेहतरीन प्रोडक्ट्स",
    tryTilingBtn: "कमरे में बिछा कर देखें",
    quickInquiry: "व्हाट्सएप पूछताछ",
    reserveShowroom: "शोरूम विजिट बुक करें",
    reserveSub: "मकान के नक्शे के साथ टाइल्स सैंपल और लोडिंग गाड़ी का एस्टीमेट लेने के लिए शोरूम अपॉइंटमेंट बुक करें। हमारे प्रतिनिधि 3 घंटे में संपर्क करेंगे।",
    yourName: "आपका पूरा नाम",
    yourPhone: "मोबाइल फ़ोन नंबर",
    yourEmail: "ईमेल आईडी",
    yourMessage: "मैसेज / टाइल्स साइज व ज़रूरत का विवरण",
    bookSuccess: "शोरूम अपॉइंटमेंट बुक हो गया है!",
    bookSuccessSub: "आपका अपॉइंटमेंट दर्ज कर लिया गया है। हमारे प्रतिनिधि बहुत जल्द आपसे संपर्क कर सैंपल पेपर्स शेयर करेंगे।",
    dispatchBtn: "अपॉइंटमेंट बुक करें",

    consoleLogin: "व्यवस्थापक लॉग इन",
    emailLabel: "एडमिन ईमेल पता",
    passLabel: "एक्सेस सुरक्षा पासवर्ड",
    authCredentials: "डेमो लॉगिन क्रेडेंशियल्स:",
    establishSession: "एडमिन सेशन शुरू करें",
    backToShowroom: "पब्लिक शोरूम वापस जाएं"
  },
  hinglish: {
    digitalShowroom: "Grahak Showroom",
    tilingStudio: "Room Me Tile Lagayein",
    warehouseInventory: "Godown Ka Stock",
    posBilling: "Naya Bill Desk",
    customerLedger: "Khata Book (Udhaar Register)",
    appTitle: "RP Tiles Luxury Depot",
    adminTitle: "Admin Panel Console",
    resetDefaults: "Defaults Lagao",
    connectPhone: "Phone Connect Karlo",
    logOut: "Log Out",
    publicSite: "Bahar Ki Website",
    adminLogin: "Admin Login",
    accessPos: "Bill Desk Par Chalein",

    gstTax: "GST (18% Tax)",
    rupees: "₹",
    sqftUnit: "sqft",
    pcsUnit: "pieces",
    boxUnit: "box",
    finish: "Finish Type",
    material: "Material",
    size: "Size",
    price: "Price",
    stock: "Stock Kitna Hai",
    minStock: "Min Stock Alert",
    skuCode: "SKU Code",
    category: "Category",
    activeStatus: "Status",
    actions: "Kaam",
    total: "Total",
    save: "Save Karein",
    cancel: "Cancel Karein",
    delete: "Hataiyein",
    add: "Naya Maal Jodein",
    search: "Dhoondhein...",

    grahakDetails: "Grahak / Customer Ki Details",
    grahakName: "Customer Ka Naam",
    grahakPhone: "Customer Phone Number",
    grahakAddress: "Delivery Address/Side",
    billingCart: "Bill Cart (Saaman List)",
    emptyCart: "Cart bilkul khali hai. Left side se tile add karein.",
    discountRate: "Cash Discount (%)",
    gstRate: "GST Rate (%)",
    loadingCharges: "Gaddi Loading/Labour (₹)",
    labourCharges: "Mistri/ Labour Madad (₹)",
    otherCharges: "Bhaada / Gadi Kiraya (₹)",
    chargesReason: "Extra Kharcha Kyun Hua",
    paymentType: "Kaise Paisa Diya",
    paymentTypeDescription: "Paisa kis tareeqe se aya",
    receivePartPayment: "Udhaar ya Advance Setting (Part Payment)",
    receivePartPaymentDesc: "Grahak pura cash de raha hai, kuch jama baki udhaar, ya 100% udhaari khata hai?",
    fullyPaidBtn: "Pura Paid (Full Jama)",
    partPaidBtn: "Part Payment (Halwa-Split)",
    allDueBtn: "Khate Me Likhein (Full Udhaar)",
    paidAmountLabel: "Grahak Se Kitna Cash Mila (₹)",
    remainingDueLabel: "Baki Kitna Udhaar Raha (Baqaya) (₹)",
    subtotalLabel: "Bill Subtotal (Bina Tax)",
    grandTotalLabel: "Net Amount (Pura Bill)",
    createBillBtn: "Bill Pakka Karke Khate Me Likhein",
    clearDueBtn: "Udhaar Chukaayein",
    quickAddBtn: "Cart Me Jodein",
    customPriceLabel: "Special Lagayi Rate (₹)",
    customDiscountLabel: "Item Pe Discount (%)",
    remarksLabel: "Shade/Batch Remarks",

    taxInvoiceHeader: "ESTIMATE BILL / CASH INVOICE / KHATA RECEIPT",
    authorisedSignatory: "Owner Ki Sign Dustak",
    walkInCustomer: "Counter Grahak (Walk-In)",
    invoiceNo: "Receipt Bill No.",
    dateLabel: "Bill Tarikh",
    totalReceived: "Total Cash Jama (Received)",
    totalBalanceDue: "Remaining Baqaya (Dues / Udhaar)",
    printBillBtn: "Bill Print Nikalein",
    whatsappBillBtn: "WhatsApp Par Bill Pejein",
    closeBillBtn: "Bill Done (Band Karein)",

    khataBookHeading: "Grahak Khata Book (Ledger)",
    khataBookDesc: "Grahak ki baqaya udhaari track karein. Jama-Khata bahi and Payment receipts automatic manage karein.",
    totalCustomers: "Total Registered Grahaks",
    totalOutstanding: "Total Bazar Ki Udhaari",
    lastPaymentDate: "Aakhri Transaction Detail",
    addPaymentBtn: "Paisa Jama Karein (Add Payment)",
    settlementLabel: "Jama Khata / Settle",
    addDueBtn: "Manually Udhaar Jodein",
    historyLedger: "Customer Khata History (Ledger Report)",
    particulars: "Detail / Kyun Diya",
    debitMinus: "Mila Hua Udhaar (Udhaari Naam +)",
    creditPlus: "Customer Ka Jama Paisa (Jama Shuda -)",
    outstandingBalance: "Baki Baqaya (Dues)",
    statusCleared: "Chukaya Hua (Cleared)",
    statusDue: "Udhaar Baki Hai",
    recordPaymentModal: "Khate Me Naya Jama Entry Likhein",
    paymentRemarksPlaceholder: "Kuch details likhein (jaise - tile delivery ke bad counter par baki cash mila)...",

    heroTitle1: "Pristine High Finish Tiles",
    heroTitle2: "Makaan Bane Sabse Pyaara.",
    heroSub: "RP Tiles me aapko milta hai behtareen quality vitrified tiles, marble slabs aur elegant bathroom fittings. 3D Simulator run karein aur tile check karein immediately.",
    browseGallery: "Floor Gallery Dekhein",
    activeShowcase: "Active Showroom Showcase Tiles",
    tryTilingBtn: "Room Me Lga Kar Dekho",
    quickInquiry: "WhatsApp Par Poochein",
    reserveShowroom: "Showroom Visit Book Karein",
    reserveSub: "Apne ghar ka map lakar tiles design estimate aur gaadi kiraya check karne ke liye live desk reserve karein. Team 3 ghante me call karegi.",
    yourName: "Aapka Pura Naam",
    yourPhone: "Mobile / Phone No.",
    yourEmail: "Email (For Quote PDF)",
    yourMessage: "Saman Ka Detail / Size details",
    bookSuccess: "Showroom Visit Safe Book Ho Gya!",
    bookSuccessSub: "Aapka entry slot save ho gya hai. Humare advisors bohot jaldi aapse phone par sample images share krenge.",
    dispatchBtn: "Appointment Book Karein",

    consoleLogin: "Admin Login Console",
    emailLabel: "Administrative Email Id",
    passLabel: "Access Security Password",
    authCredentials: "Demo Login Details:",
    establishSession: "Login Confirm Karein",
    backToShowroom: "Bahar Grahak Showroom Pe Chalein"
  }
};
