export interface KnowledgeEntry {
    keywords: string[];
    context?: string[]; // Optional sub-topics like 'symptoms', 'treatment'
    responses: {
        en: string;
        ar: string;
    };
}

export const MEDICAL_KNOWLEDGE: KnowledgeEntry[] = [
    {
        keywords: ['platform', 'supported scans', 'scan types', 'what do you support', 'ct scan', 'x-ray', 'xray', 'cxr', 'features', 'models', 'المنصة', 'أنواع الأشعة', 'الاشعة المدعومة', 'الموديلات', 'بتدعم ايه'],
        responses: {
            en: "### **Morgan's Hope Current AI Coverage**\n\nMorgan's Hope supports **Chest CT** and **Chest X-Ray** screening.\n\n**Chest CT:** the existing CT lung-cancer classifier remains unchanged and covers: Normal, Benign, Adenocarcinoma, Large Cell Carcinoma, Squamous Cell Carcinoma, and Malignant General.\n\n**Chest X-Ray:** the old binary CXR model has been removed. The current deployed NIH ChestX-ray14 model is a 7-class multi-label pipeline that covers: Pulmonary Infection, COPD-related Findings, Fibrotic Lung Disease, Cardiac Conditions, Potential Malignancy Findings, Pleural Diseases, and No Finding. A dedicated TB signal and TB localization pipeline also run alongside the X-ray model.\n\nThis is AI screening support only, not a final diagnosis.",
            ar: "### **التغطية الحالية في Morgan's Hope**\n\nتدعم المنصة حالياً **CT للصدر** و **الأشعة السينية للصدر**.\n\n**CT للصدر:** موديل CT الحالي لتصنيف سرطان الرئة يظل كما هو ويغطي: طبيعي، حميد، سرطان غدي، سرطان كبير الخلايا، سرطان حرشفي، وخبيث عام.\n\n**الأشعة السينية للصدر:** تم إزالة موديل CXR الثنائي القديم. الاتجاه الحالي يفحص مجموعات مرضية أوسع: عدوى/التهاب رئوي، ملاحظات مرتبطة بالانسداد الرئوي، أمراض التليف الرئوي، مؤشرات قلبية، مؤشرات اشتباه أورام، وأمراض الغشاء البلوري. ويمكن استخدام إشارة مخصصة للسل عند توفر موديل TB.\n\nهذا فحص مساعد بالذكاء الاصطناعي فقط وليس تشخيصاً نهائياً."
        }
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'مرحبا', 'أهلا', 'سلام', 'هاي', 'ازيك'],
        responses: {
            en: "**Hello! I am your Morgan's Hope AI Assistant.** 👋\n\nI am specialized in respiratory health and chest imaging support. I can help you understand CT lung-cancer screening, Chest X-Ray clinical disease groups, symptoms, reports, or how to upload your scan.\n\n**How can I assist you today?** You can ask me about Lung Cancer, Tuberculosis, Pneumonia, COPD, fibrosis, pleural disease, or how to use the platform.",
            ar: "**أهلاً بك! أنا مساعد مورجان هوب الذكي.** 👋\n\nأنا متخصص في صحة الجهاز التنفسي ودعم فهم صور الصدر. يمكنني مساعدتك في فهم فحص سرطان الرئة في CT، ومجموعات أمراض الصدر في الأشعة السينية، والأعراض، والتقارير، أو طريقة رفع الأشعة.\n\n**كيف يمكنني مساعدتك اليوم؟** يمكنك سؤالي عن سرطان الرئة، السل، الالتهاب الرئوي، COPD، التليف، أمراض الغشاء البلوري، أو كيفية استخدام المنصة."
        }
    },
    // LUNG CANCER - MEGA ENTRY
    {
        keywords: ['lung cancer', 'cancer', 'adenocarcinoma', 'malignant', 'سرطان', 'خبيث', 'أورام'],
        responses: {
            en: "### **Lung Cancer Overview** 🫁\n\n**Lung cancer** is a type of cancer that begins in the lungs. Your lungs are two spongy organs in your chest that take in oxygen when you inhale and release carbon dioxide when you exhale.\n\n#### **Key Points:**\n*   **Types:** The two main types are Non-Small Cell Lung Cancer (NSCLC) and Small Cell Lung Cancer (SCLC).\n*   **Causes:** Smoking is the leading cause, but it can also affect non-smokers due to genetic factors or environmental exposure.\n*   **Morgan's Hope CT Screening:** The existing CT model supports six classes: Normal, Benign, Adenocarcinoma, Large Cell Carcinoma, Squamous Cell Carcinoma, and Malignant General.\n*   **CXR Screening:** Chest X-Ray can flag Potential Malignancy Findings as one of several broader clinical groups.\n\n**Would you like to know more about symptoms, CT classes, or how to use the AI screening flow?**",
            ar: "### **نظرة عامة على سرطان الرئة** 🫁\n\n**سرطان الرئة** هو نوع من السرطان يبدأ في الرئتين. الرئتان هما عضوان إسفنجيان في صدرك يأخذان الأكسجين عند الشهيق ويطلقان ثاني أكسيد الكربون عند الزفير.\n\n#### **نقاط رئيسية:**\n*   **الأنواع:** النوعان الرئيسيان هما سرطان الرئة غير صغير الخلايا (NSCLC) وسرطان الرئة صغير الخلايا (SCLC).\n*   **الأسباب:** التدخين هو السبب الرئيسي، ولكنه قد يصيب غير المدخنين أيضاً بسبب عوامل وراثية أو التعرض البيئي (مثل الرادون أو الأسبستوس).\n*   **الاكتشاف:** الكشف المبكر هو أمر حيوي. تستخدم منصتنا نماذج **ذكاء اصطناعي متقدمة** لتحليل صور الأشعة المقطعية والسينية بدقة تصل إلى **99%**.\n\n**هل تود معرفة المزيد عن الأعراض، العلاج، أو كيفية استخدام الذكاء الاصطناعي لدينا للفحص؟**"
        }
    },
    {
        keywords: ['lung cancer', 'cancer', 'سرطان', 'أعراض', 'symptoms', 'signs', 'اعراض'],
        context: ['symptoms', 'اعراض', 'أعراض'],
        responses: {
            en: "### **Symptoms of Lung Cancer** ⚠️\n\nLung cancer typically doesn't cause signs and symptoms in its earliest stages. Signs and symptoms of lung cancer typically occur when the disease is advanced.\n\n**Common symptoms include:**\n1.  **Persistent Cough:** A new cough that doesn't go away.\n2.  **Hemoptysis:** Coughing up blood, even a small amount.\n3.  **Shortness of Breath:** Feeling winded easily.\n4.  **Chest Pain:** Pain in your chest area that often gets worse with deep breathing.\n5.  **Hoarseness:** Changes in your voice.\n6.  **Unexplained Weight Loss:** Losing weight without trying.\n7.  **Bone Pain:** Especially in the back or hips.\n\n**Important:** If you have any persistent signs or symptoms that worry you, make an appointment with your doctor immediately.",
            ar: "### **أعراض سرطان الرئة** ⚠️\n\nعادةً لا يسبب سرطان الرئة علامات وأعراضاً في مراحله الأولى. تظهر العلامات والأعراض عادةً عندما يكون المرض متقدماً.\n\n**تشمل الأعراض الشائعة:**\n1.  **سعال مستمر:** سعال جديد لا يزول.\n2.  **نفث الدم:** سعال مصحوب بدم، حتى لو كانت كمية صغيرة.\n3.  **ضيق التنفس:** الشعور بضيق التنفس بسهولة.\n4.  **ألم في الصدر:** ألم في منطقة الصدر يزداد غالباً مع التنفس العميق.\n5.  **بحة في الصوت:** تغيرات في صوتك.\n6.  **فقدان الوزن غير المبرر:** فقدان الوزن دون محاولة ذلك.\n7.  **ألم العظام:** خاصة في الظهر أو الوركين.\n\n**هام:** إذا كان لديك أي علامات أو أعراض مستمرة تقلقك، فحدد موعداً مع طبيبك على الفور."
        }
    },
    // TUBERCULOSIS (TB) - MEGA ENTRY
    {
        keywords: ['tuberculosis', 'tb', 'سل', 'درن'],
        responses: {
            en: "### **Understanding Tuberculosis (TB)** 🦠\n\n**Tuberculosis (TB)** is a potentially serious infectious disease that mainly affects your lungs. The bacteria that cause tuberculosis are spread through tiny droplets released into the air via coughs and sneezes.\n\n#### **Crucial Info:**\n*   **Latent vs. Active:** You can carry TB bacteria without symptoms, or it can develop into active disease.\n*   **Treatment:** TB is treatable and curable with medical supervision.\n*   **Morgan's Hope:** The Chest X-Ray pipeline is prepared for an optional dedicated TB signal when the TB model artifact is available.\n\n**Important:** A TB suspicion always needs physician review and appropriate laboratory/clinical confirmation.",
            ar: "### **فهم مرض السل (TB)** 🦠\n\n**السل (Tuberculosis)** هو مرض معدٍ خطير محتمل يصيب الرئتين بشكل أساسي. تنتشر البكتيريا التي تسبب السل من شخص لآخر من خلال قطرات صغيرة تطلق في الهواء عبر السعال والعطس.\n\n#### **معلومات هامة:**\n*   **السل الكامن مقابل النشط:** يمكنك حمل البكتيريا في جسمك دون أن تمرض (السل الكامن) أو يمكن أن تتطور إلى مرض كامل (السل النشط).\n*   **العلاج:** السل قابل للعلاج والشفاء. يتضمن العلاج عادةً مزيجاً من المضادات الحيوية لمدة 6 إلى 9 أشهر.\n*   **الوقاية:** يمكن للقاح BCG أن يساعد في الوقاية من السل لدى الأطفال.\n\n**في مورجان هوب، نقوم بتطوير وحدة ذكاء اصطناعي متخصصة لاكتشاف أنماط السل في الأشعة السينية للصدر لتسريع التشخيص في المناطق عالية الخطورة.**"
        }
    },
    {
        keywords: ['tuberculosis', 'tb', 'سل', 'درن', 'أعراض', 'symptoms', 'اعراض', 'علامات'],
        context: ['symptoms', 'اعراض', 'أعراض'],
        responses: {
            en: "### **Symptoms of Active Tuberculosis** 🌡️\n\nSigns and symptoms of active TB include:\n\n1.  **Long-term Cough:** Coughing that lasts three or more weeks.\n2.  **Blood in Sputum:** Coughing up blood or mucus.\n3.  **Chest Pain:** Pain with breathing or coughing.\n4.  **Weight Loss:** Unintentional loss of weight.\n5.  **Fatigue:** Feeling constantly tired.\n6.  **Fever:** Often a low-grade fever.\n7.  **Night Sweats:** Waking up drenched in sweat.\n8.  **Chills:** Feeling cold without a clear reason.\n\n**Note:** TB can also affect other parts of your body, including your kidneys, spine or brain. When TB occurs outside your lungs, signs and symptoms vary according to the organs involved.",
            ar: "### **أعراض السل النشط** 🌡️\n\nتشمل علامات وأعراض السل النشط ما يلي:\n\n1.  **سعال طويل الأمد:** سعال يستمر لثلاثة أسابيع أو أكثر.\n2.  **دم في البلغم:** سعال مصحوب بدم أو مخاط.\n3.  **ألم في الصدر:** ألم مع التنفس أو السعال.\n4.  **فقدان الوزن:** فقدان الوزن المفاجئ.\n5.  **التعب:** الشعور بالتعب المستمر.\n6.  **الحمى:** غالباً ما تكون حمى خفيفة.\n7.  **التعرق الليلي:** الاستيقاظ غارقاً في العرق.\n8.  **القشعريرة:** الشعور بالبرد دون سبب واضح.\n\n**ملاحظة:** يمكن أن يصيب السل أيضاً أجزاء أخرى من جسمك، بما في ذلك الكلى أو العمود الفقري أو الدماغ. عندما يحدث السل خارج الرئتين، تختلف العلامات والأعراض وفقاً للأعضاء المعنية."
        }
    },
    {
        keywords: ['pneumonia', 'pulmonary infection', 'chest infection', 'infection', 'التهاب رئوي', 'عدوى رئوية'],
        responses: {
            en: "### **Pulmonary Infection on Chest X-Ray**\n\nPulmonary Infection is one of the current Chest X-Ray clinical groups in Morgan's Hope. It may point toward infection-like chest findings such as pneumonia patterns, but the AI result is not enough to decide the exact cause or treatment.\n\nA physician may still need symptoms, examination, lab tests, and sometimes follow-up imaging to distinguish bacterial, viral, or other causes.",
            ar: "### **عدوى/التهاب رئوي في الأشعة السينية**\n\nPulmonary Infection هي إحدى المجموعات الحالية في مسار Chest X-Ray داخل Morgan's Hope. قد تشير إلى ملاحظات تشبه العدوى أو الالتهاب الرئوي، لكن نتيجة الذكاء الاصطناعي وحدها لا تكفي لتحديد السبب أو العلاج.\n\nقد يحتاج الطبيب إلى الأعراض، والفحص، والتحاليل، وأحياناً تصوير متابعة للتمييز بين الأسباب البكتيرية أو الفيروسية أو غيرها."
        }
    },
    // PNEUMONIA - MEGA ENTRY
    {
        keywords: ['pneumonia', 'التهاب رئوي', 'infection', 'عدوى'],
        responses: {
            en: "### **Pneumonia: The Lung Infection** 🌡️\n\n**Pneumonia** is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus (purulent material), causing cough with phlegm or pus, fever, chills, and difficulty breathing.\n\n#### **Quick Facts:**\n*   **Causes:** A variety of organisms, including bacteria, viruses, and fungi, can cause pneumonia.\n*   **Severity:** It can range in seriousness from mild to life-threatening. It is most serious for infants and young children, people older than age 65, and people with health problems or weakened immune systems.\n*   **AI Outlook:** Morgan's Hope is training new models to differentiate between viral pneumonia (like COVID-19) and bacterial pneumonia using X-ray history.",
            ar: "### **الالتهاب الرئوي: عدوى الرئة** 🌡️\n\n**الالتهاب الرئوي (Pneumonia)** هو عدوى تؤدي إلى التهاب الأكياس الهوائية في إحدى الرئتين أو كلتيهما. قد تمتلئ الأكياس الهوائية بالسوائل أو الصديد، مما يسبب سعالاً مصحوباً ببلغم، وحمى، وقشعريرة، وصعوبة في التنفس.\n\n#### **حقائق سريعة:**\n*   **الأسباب:** يمكن لمجموعة متنوعة من الكائنات الحية، بما في ذلك البكتيريا والفيروسات والفطريات، أن تسبب الالتهاب الرئوي.\n*   **الخطورة:** يمكن أن تتراوح خطورته من طفيفة إلى مهددة للحياة. وهو أكثر خطورة على الرضع والأطفال الصغار، والأشخاص الذين تزيد أعمارهم عن 65 عاماً، والأشخاص الذين يعانون من مشاكل صحية أو ضعف في جهاز المناعة.\n*   **تطلعات الذكاء الاصطناعي:** تقوم مورجان هوب بتدريب نماذج جديدة للتمييز بين الالتهاب الرئوي الفيروسي (مثل كوفيد-19) والالتهاب الرئوي البكتيري باستخدام سجل الأشعة السينية."
        }
    },
    // COPD - MEGA ENTRY
    {
        keywords: ['copd', 'انسداد رئوي', 'chronic obstructive', 'مزمن'],
        responses: {
            en: "### **COPD: Chronic Obstructive Pulmonary Disease** 💨\n\n**COPD** is a chronic inflammatory lung disease that causes obstructed airflow from the lungs. Symptoms include breathing difficulty, cough, mucus (sputum) production, and wheezing.\n\n#### **Understanding COPD:**\n*   **Causes:** It's typically caused by long-term exposure to irritating gases or particulate matter, most often from cigarette smoke.\n*   **Conditions:** People with COPD are at increased risk of developing heart disease, lung cancer and a variety of other conditions.\n*   **Management:** While COPD is a progressive disease that gets worse over time, it is treatable. With proper management, most people with COPD can achieve good symptom control and quality of life.",
            ar: "### **انسداد الشعب الهوائية المزمن (COPD)** 💨\n\n**مرض الانسداد الرئوي المزمن** هو مرض التهابي مزمن يسبب انسداد تدفق الهواء من الرئتين. تشمل الأعراض صعوبة التنفس، والسعال، وإنتاج المخاط (البلغم)، والأزيز.\n\n#### **فهم المرض:**\n*   **الأسباب:** يحدث عادةً بسبب التعرض طويل الأمد للغازات المهيجة أو الجسيمات، وغالباً ما يكون بسبب دخان السجائر.\n*   **المضاعفات:** الأشخاص المصابون بـ COPD هم أكثر عرضة للإصابة بأمراض القلب وسرطان الرئة ومجموعة متنوعة من الحالات الأخرى.\n*   **التعامل مع المرض:** على الرغم من أنه مرض تدريجي يزداد سوءاً بمرور الوقت، إلا أنه قابل للعلاج. مع الإدارة السليمة، يمكن لمعظم المرضى تحقيق سيطرة جيدة على الأعراض ونوعية حياة جيدة."
        }
    }
];

/**
 * Detects if the input string is primarily Arabic
 */
const isArabic = (text: string): boolean => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
};

export const getLocalResponse = (input: string): string | null => {
    const lowerInput = input.toLowerCase();
    const inputIsArabic = isArabic(input);
    const respondIn: 'en' | 'ar' = inputIsArabic ? 'ar' : 'en';

    // Sort by specificity (context matches first)
    for (const entry of MEDICAL_KNOWLEDGE) {
        // Check if at least one main keyword and one context keyword match
        const mainKeywordMatch = entry.keywords.some(kw => lowerInput.includes(kw));
        const contextMatch = entry.context ? entry.context.some(c => lowerInput.includes(c)) : false;

        if (mainKeywordMatch && contextMatch) {
            return entry.responses[respondIn];
        }
    }

    // Secondary pass for main keywords only
    for (const entry of MEDICAL_KNOWLEDGE) {
        if (!entry.context && entry.keywords.some(kw => lowerInput.includes(kw))) {
            return entry.responses[respondIn];
        }
    }

    return null;
};
