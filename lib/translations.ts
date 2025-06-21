export type Language = "en" | "ms" | "zh";

export interface Translations {
  // Header
  checkmate: string;
  getNews: string;
  signIn: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  urlPlaceholder: string;
  analyzeButton: string;
  analyzing: string;
  tryAgain: string;
  reset: string;
  saveAnalysis: string;
  saving: string;
  saved: string;
  analysisComplete: string;
  showAnalysis: string;
  hideAnalysis: string;

  // Analysis Results
  transcription: string;
  metadata: string;
  title: string;
  description: string;
  creator: string;
  platform: string;
  newsDetection: string;
  hasNewsContent: string;
  confidence: string;
  needsFactCheck: string;
  requiresFactCheck: string;
  contentType: string;
  factCheck: string;
  verdict: string;
  explanation: string;
  sources: string;
  credibleSources: string;

  // Status labels
  verified: string;
  true: string;
  false: string;
  misleading: string;
  unverifiable: string;

  // How it works
  howItWorksTitle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;

  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  getStarted: string;
  learnMore: string;

  // How It Works Steps
  inputTikTokLink: string;
  inputTikTokLinkDesc: string;
  audioTranscription: string;
  audioTranscriptionDesc: string;
  newsDetection2: string;
  newsDetectionDesc: string;
  researchFactCheck: string;
  researchFactCheckDesc: string;
  credibilityReport: string;
  credibilityReportDesc: string;
  howItWorksSubtitle: string;

  // Footer
  builtWith: string;
  fightMisinformation: string;

  // Messages
  enterUrl: string;
  analysisStarted: string;
  cannotSave: string;
  alreadySaved: string;
  analysisSaved: string;
  failedToSave: string;

  // Theme toggle
  toggleTheme: string;
  light: string;
  dark: string;
  system: string;

  // Language toggle
  toggleLanguage: string;
  english: string;
  malay: string;
  chinese: string;

  // Additional Hero Section
  aiPoweredFactChecking: string;
  tryExample: string;
  analysisFailed: string;
  overallVerification: string;
  analysis: string;
  showLess: string;
  showMore: string;
  sourcesFound: string;
  verifiedLabel: string;
  yes: string;
  no: string;
  signInToSave: string;
  analyzing2: string;
  transcriptionComplete: string;
  checkingFacts: string;

  // News Page
  trendingOnCheckmate: string;
  topCredibleSources: string;
  topMisinformationSources: string;
  viewDetails: string;
  noCredibleSources: string;
  noMisinformationSources: string;

  // Creator Page
  highlyCredible: string;
  moderatelyCredible: string;
  lowCredibility: string;
  credibilityRating: string;
  totalAnalyses: string;
  lastAnalyzed: string;
  analyses: string;
  contentAnalyses: string;
  noAnalysesFound: string;
  untitledVideo: string;
  rating: string;
  view: string;
  communityComments: string;
  shareThoughts: string;
  postComment: string;
  noCommentsYet: string;
  anonymous: string;
  creatorNotFound: string;
  creatorNotFoundMessage: string;

  // Analysis Page
  loadingAnalysis: string;
  pleaseWait: string;
  analysisNotFound: string;
  analysisNotFoundMessage: string;
  backToNews: string;
  backToAllAnalyses: string;
  unknownCreator: string;
  viewOriginalVideo: string;
  viewAuthor: string;
  language: string;
  contentAnalysis: string;
  factCheckResults: string;
  overallVerificationStatus: string;
  verifiedTrue: string;
  needsVerification: string;
  claim: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    checkmate: "Checkmate",
    getNews: "Get News",
    signIn: "Sign In",

    // Hero Section
    heroTitle: "Verify Content with Checkmate",
    heroSubtitle:
      "Paste any TikTok, X (Twitter), blog, or news URL to get instant transcription, analysis, and credibility assessment powered by advanced AI.",
    urlPlaceholder: "Enter  URL (e.g., https://vm.tiktok.com/...)",
    analyzeButton: "Analyze Content",
    analyzing: "Analyzing...",
    tryAgain: "Try Again",
    reset: "Reset",
    saveAnalysis: "Save Analysis",
    saving: "Saving...",
    saved: "Saved",
    analysisComplete: "Analysis Complete",
    showAnalysis: "Show Full Analysis",
    hideAnalysis: "Hide Analysis",

    // Analysis Results
    transcription: "Transcription",
    metadata: "Video Metadata",
    title: "Title",
    description: "Description",
    creator: "Creator",
    platform: "Platform",
    newsDetection: "News Detection",
    hasNewsContent: "Has News Content",
    confidence: "Confidence",
    needsFactCheck: "Needs Fact Check",
    requiresFactCheck: "Requires Fact-Check",
    contentType: "Content Type",
    factCheck: "Fact Check",
    verdict: "Verdict",
    explanation: "Explanation",
    sources: "Sources",
    credibleSources: "Credible Sources",

    // Status labels
    verified: "Verified",
    true: "True",
    false: "False",
    misleading: "Misleading",
    unverifiable: "Unverifiable",

    // How it works
    howItWorksTitle: "How It Works",
    step1Title: "Paste URL",
    step1Description: "Simply paste any TikTok video URL into our analyzer.",
    step2Title: "AI Analysis",
    step2Description:
      "Our AI transcribes the content and performs comprehensive fact-checking.",
    step3Title: "Get Results",
    step3Description:
      "Receive detailed credibility assessment with sources and explanations.",

    // CTA Section
    ctaTitle: "Ready to Fight Misinformation?",
    ctaDescription:
      "Join the fight against misinformation. Start fact-checking TikTok content today.",
    getStarted: "Get Started Free",
    learnMore: "Learn More",

    // How It Works Steps
    inputTikTokLink: "Input TikTok Link",
    inputTikTokLinkDesc:
      "Simply paste any TikTok video URL into our secure input field",
    audioTranscription: "Audio Transcription",
    audioTranscriptionDesc:
      "AI-powered transcription extracts and converts speech to text",
    newsDetection2: "News Detection",
    newsDetectionDesc:
      "AI classifies content to identify news and factual claims",
    researchFactCheck: "Research & Fact-Check",
    researchFactCheckDesc:
      "Cross-reference claims with credible sources and databases",
    credibilityReport: "Credibility Report",
    credibilityReportDesc:
      "Get a comprehensive report with sources and verification status",
    howItWorksSubtitle:
      "Our 5-step process ensures comprehensive fact-checking",

    // Footer
    builtWith: "Built with",
    fightMisinformation: "© 2024 Checkmate. Fighting misinformation with AI.",

    // Messages
    enterUrl: "Please enter a URL to analyze.",
    analysisStarted: "Starting analysis... This may take a moment.",
    cannotSave: "Cannot save analysis - please ensure you're logged in",
    alreadySaved: "Analysis already saved!",
    analysisSaved: "Analysis saved successfully!",
    failedToSave: "Failed to save analysis. Please try again.",

    // Theme toggle
    toggleTheme: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",

    // Language toggle
    toggleLanguage: "Toggle language",
    english: "English",
    malay: "Malay",
    chinese: "Chinese",

    // Additional Hero Section
    aiPoweredFactChecking: "AI-Powered Fact-Checking",
    tryExample: "Try Example",
    analysisFailed: "Analysis failed. Please try again.",
    overallVerification: "Overall Verification",
    analysis: "Analysis",
    showLess: "Show Less",
    showMore: "Show More",
    sourcesFound: "Sources Found",
    verifiedLabel: "Verified",
    yes: "Yes",
    no: "No",
    signInToSave: "Sign in to save analysis",
    analyzing2: "Analyzing...",
    transcriptionComplete: "Transcription complete",
    checkingFacts: "Checking facts...",

    // News Page
    trendingOnCheckmate: "Trending on Checkmate",
    topCredibleSources: "Top Credible Sources",
    topMisinformationSources: "Top Misinformation Sources",
    viewDetails: "View Details",
    noCredibleSources: "No credible sources found yet",
    noMisinformationSources: "No misinformation sources found yet",

    // Creator Page
    highlyCredible: "Highly Credible",
    moderatelyCredible: "Moderately Credible",
    lowCredibility: "Low Credibility",
    credibilityRating: "Credibility Rating",
    totalAnalyses: "Total Analyses",
    lastAnalyzed: "Last Analyzed",
    analyses: "analyses",
    contentAnalyses: "Content Analyses",
    noAnalysesFound: "No analyses found for this creator yet.",
    untitledVideo: "Untitled Video",
    rating: "Rating",
    view: "View",
    communityComments: "Community Comments",
    shareThoughts: "Share your thoughts about this creator...",
    postComment: "Post Comment",
    noCommentsYet: "No comments yet. Be the first to share your thoughts!",
    anonymous: "Anonymous",
    creatorNotFound: "Creator Not Found",
    creatorNotFoundMessage: "could not be found.",

    // Analysis Page
    loadingAnalysis: "Loading Analysis...",
    pleaseWait: "Please wait while we fetch the details.",
    analysisNotFound: "Analysis Not Found",
    analysisNotFoundMessage:
      "The requested analysis does not exist or could not be loaded.",
    backToNews: "Back to News",
    backToAllAnalyses: "Back to All Analyses",
    unknownCreator: "Unknown Creator",
    viewOriginalVideo: "View Original Video",
    viewAuthor: "View Author",
    language: "Language",
    contentAnalysis: "Content Analysis",
    factCheckResults: "Fact-Check Results",
    overallVerificationStatus: "Overall Verification Status",
    verifiedTrue: "Verified True",
    needsVerification: "Needs Verification",
    claim: "Claim:",
  },

  ms: {
    // Header
    checkmate: "Checkmate",
    getNews: "Dapatkan Berita",
    signIn: "Log Masuk",

    // Hero Section
    heroTitle: "Sahkan Kandungan dengan Checkmate",
    heroSubtitle:
      "Tampalkan mana-mana URL TikTok, X (Twitter), blog, atau berita untuk mendapat transkripsi segera, analisis, dan penilaian kredibiliti dikuasakan oleh AI canggih.",
    urlPlaceholder: "Masukkan URL  (cth., https://vm.tiktok.com/...)",
    analyzeButton: "Analisis Kandungan",
    analyzing: "Menganalisis...",
    tryAgain: "Cuba Lagi",
    reset: "Set Semula",
    saveAnalysis: "Simpan Analisis",
    saving: "Menyimpan...",
    saved: "Disimpan",
    analysisComplete: "Analisis Selesai",
    showAnalysis: "Tunjukkan Analisis Penuh",
    hideAnalysis: "Sembunyikan Analisis",

    // Analysis Results
    transcription: "Transkripsi",
    metadata: "Metadata Video",
    title: "Tajuk",
    description: "Keterangan",
    creator: "Pencipta",
    platform: "Platform",
    newsDetection: "Pengesanan Berita",
    hasNewsContent: "Mempunyai Kandungan Berita",
    confidence: "Keyakinan",
    needsFactCheck: "Memerlukan Pemeriksaan Fakta",
    requiresFactCheck: "Perlu Pemeriksaan Fakta",
    contentType: "Jenis Kandungan",
    factCheck: "Pemeriksaan Fakta",
    verdict: "Keputusan",
    explanation: "Penjelasan",
    sources: "Sumber",
    credibleSources: "Sumber Boleh Dipercayai",

    // Status labels
    verified: "Disahkan",
    true: "Benar",
    false: "Palsu",
    misleading: "Mengelirukan",
    unverifiable: "Tidak Boleh Disahkan",

    // How it works
    howItWorksTitle: "Bagaimana Ia Berfungsi",

    // Additional How it works (for compatibility with Translations type)
    step1Title: "Tampal URL",
    step1Description:
      "Hanya tampalkan mana-mana URL video TikTok ke dalam penganalisis kami.",
    step2Title: "Analisis AI",
    step2Description:
      "AI kami mentranskrip kandungan dan melakukan pemeriksaan fakta yang komprehensif.",
    step3Title: "Dapatkan Keputusan",
    step3Description:
      "Terima penilaian kredibiliti terperinci dengan sumber dan penjelasan.",

    // CTA Section
    ctaTitle: "Bersedia untuk Melawan Maklumat Palsu?",
    ctaDescription:
      "Sertai perjuangan melawan maklumat palsu. Mula semak fakta kandungan TikTok hari ini.",
    getStarted: "Mula Percuma",
    learnMore: "Ketahui Lagi",

    // How It Works Steps
    inputTikTokLink: "Masukkan Pautan TikTok",
    inputTikTokLinkDesc:
      "Hanya tampalkan mana-mana URL video TikTok ke dalam medan input selamat kami",
    audioTranscription: "Transkripsi Audio",
    audioTranscriptionDesc:
      "Transkripsi berkuasa AI mengekstrak dan menukar pertuturan kepada teks",
    newsDetection2: "Pengesanan Berita",
    newsDetectionDesc:
      "AI mengklasifikasikan kandungan untuk mengenal pasti berita dan dakwaan fakta",
    researchFactCheck: "Penyelidikan & Pemeriksaan Fakta",
    researchFactCheckDesc:
      "Rujuk silang dakwaan dengan sumber dan pangkalan data yang boleh dipercayai",
    credibilityReport: "Laporan Kredibiliti",
    credibilityReportDesc:
      "Dapatkan laporan komprehensif dengan sumber dan status pengesahan",
    howItWorksSubtitle:
      "Proses 5 langkah kami memastikan pemeriksaan fakta yang komprehensif",

    // Footer
    builtWith: "Dibina dengan",
    fightMisinformation: "© 2024 Checkmate. Melawan maklumat palsu dengan AI.",

    // Messages
    enterUrl: "Sila masukkan URL untuk dianalisis.",
    analysisStarted:
      "Memulakan analisis... Ini mungkin mengambil sedikit masa.",
    cannotSave:
      "Tidak dapat menyimpan analisis - sila pastikan anda sudah log masuk",
    alreadySaved: "Analisis sudah disimpan!",
    analysisSaved: "Analisis berjaya disimpan!",
    failedToSave: "Gagal menyimpan analisis. Sila cuba lagi.",

    // Theme toggle
    toggleTheme: "Tukar tema",
    light: "Terang",
    dark: "Gelap",
    system: "Sistem",

    // Language toggle
    toggleLanguage: "Tukar bahasa",
    english: "Bahasa Inggeris",
    malay: "Bahasa Melayu",
    chinese: "Bahasa Cina",

    // Additional Hero Section (for compatibility with Translations type)
    aiPoweredFactChecking: "Pemeriksaan Fakta Berkuasa AI",
    tryExample: "Cuba Contoh",
    analysisFailed: "Analisis gagal. Sila cuba lagi.",
    overallVerification: "Pengesahan Keseluruhan",
    analysis: "Analisis",
    showLess: "Tunjuk Kurang",
    showMore: "Tunjuk Lagi",
    sourcesFound: "Sumber Ditemui",
    verifiedLabel: "Disahkan",
    yes: "Ya",
    no: "Tidak",
    signInToSave: "Log masuk untuk simpan analisis",
    analyzing2: "Menganalisis...",
    transcriptionComplete: "Transkripsi selesai",
    checkingFacts: "Memeriksa fakta...",

    // News Page
    trendingOnCheckmate: "Sedang trending di Checkmate",
    topCredibleSources: "Sumber Paling Boleh Dipercayai",
    topMisinformationSources: "Sumber Maklumat Palsu Tertinggi",
    viewDetails: "Lihat Butiran",
    noCredibleSources: "Tiada sumber boleh dipercayai ditemui lagi",
    noMisinformationSources: "Tiada sumber maklumat palsu ditemui lagi",

    // Creator Page
    highlyCredible: "Sangat Boleh Dipercayai",
    moderatelyCredible: "Sederhana Boleh Dipercayai",
    lowCredibility: "Kredibiliti Rendah",
    credibilityRating: "Penilaian Kredibiliti",
    totalAnalyses: "Jumlah Analisis",
    lastAnalyzed: "Terakhir Dianalisis",
    analyses: "analisis",
    contentAnalyses: "Analisis Kandungan",
    noAnalysesFound: "Tiada analisis ditemui untuk pencipta ini lagi.",
    untitledVideo: "Video Tanpa Tajuk",
    rating: "Penilaian",
    view: "Lihat",
    communityComments: "Komen Komuniti",
    shareThoughts: "Kongsikan pemikiran anda tentang pencipta ini...",
    postComment: "Hantar Komen",
    noCommentsYet:
      "Tiada komen lagi. Jadilah yang pertama untuk berkongsi pemikiran!",
    anonymous: "Tanpa Nama",
    creatorNotFound: "Pencipta Tidak Ditemui",
    creatorNotFoundMessage: "tidak dapat ditemui.",

    // Analysis Page
    loadingAnalysis: "Memuatkan Analisis...",
    pleaseWait: "Sila tunggu sementara kami mengambil butiran.",
    analysisNotFound: "Analisis Tidak Ditemui",
    analysisNotFoundMessage:
      "Analisis yang diminta tidak wujud atau tidak dapat dimuatkan.",
    backToNews: "Kembali ke Berita",
    backToAllAnalyses: "Kembali ke Semua Analisis",
    unknownCreator: "Pencipta Tidak Diketahui",
    viewOriginalVideo: "Lihat Video Asal",
    viewAuthor: "Lihat Pencipta",
    language: "Bahasa",
    contentAnalysis: "Analisis Kandungan",
    factCheckResults: "Keputusan Pemeriksaan Fakta",
    overallVerificationStatus: "Status Pengesahan Keseluruhan",
    verifiedTrue: "Disahkan Benar",
    needsVerification: "Perlu Pengesahan",
    claim: "Dakwaan:",
  },

  zh: {
    // Header
    checkmate: "Checkmate",
    getNews: "获取新闻",
    signIn: "登录",

    // Hero Section
    heroTitle: "使用Checkmate验证内容",
    heroSubtitle:
      "粘贴任何TikTok、X（推特）、博客或新闻的URL，即可获得由先进AI驱动的即时转录、分析和可信度评估。",
    urlPlaceholder: "输入 URL（例如：https://vm.tiktok.com/...）",
    analyzeButton: "分析内容",
    analyzing: "分析中...",
    tryAgain: "重试",
    reset: "重置",
    saveAnalysis: "保存分析",
    saving: "保存中...",
    saved: "已保存",
    analysisComplete: "分析完成",
    showAnalysis: "显示完整分析",
    hideAnalysis: "隐藏分析",

    // Analysis Results
    transcription: "转录",
    metadata: "视频元数据",
    title: "标题",
    description: "描述",
    creator: "创作者",
    platform: "平台",
    newsDetection: "新闻检测",
    hasNewsContent: "包含新闻内容",
    confidence: "置信度",
    needsFactCheck: "需要事实核查",
    requiresFactCheck: "需要事实核查",
    contentType: "内容类型",
    factCheck: "事实核查",
    verdict: "裁决",
    explanation: "解释",
    sources: "来源",
    credibleSources: "可信来源",

    // Status labels
    verified: "已验证",
    true: "真实",
    false: "虚假",
    misleading: "误导性",
    unverifiable: "无法验证",

    // How it works
    howItWorksTitle: "工作原理",
    step1Title: "粘贴URL",
    step1Description: "只需将任何TikTok视频URL粘贴到我们的分析器中。",
    step2Title: "AI分析",
    step2Description: "我们的AI转录内容并执行全面的事实核查。",
    step3Title: "获取结果",
    step3Description: "接收详细的可信度评估，包含来源和解释。",

    // CTA Section
    ctaTitle: "准备对抗错误信息？",
    ctaDescription:
      "加入对抗错误信息的战斗。今天就开始对TikTok内容进行事实核查。",
    getStarted: "免费开始",
    learnMore: "了解更多",

    // How It Works Steps
    inputTikTokLink: "输入TikTok链接",
    inputTikTokLinkDesc: "只需将任何TikTok视频URL粘贴到我们的安全输入字段中",
    audioTranscription: "音频转录",
    audioTranscriptionDesc: "AI驱动的转录提取并将语音转换为文本",
    newsDetection2: "新闻检测",
    newsDetectionDesc: "AI分类内容以识别新闻和事实声明",
    researchFactCheck: "研究与事实核查",
    researchFactCheckDesc: "将声明与可信来源和数据库进行交叉引用",
    credibilityReport: "可信度报告",
    credibilityReportDesc: "获得包含来源和验证状态的综合报告",
    howItWorksSubtitle: "我们的5步流程确保全面的事实核查",

    // Footer
    builtWith: "构建于",
    fightMisinformation: "© 2024 Checkmate. 用AI对抗错误信息。",

    // Messages
    enterUrl: "请输入要分析的URL。",
    analysisStarted: "开始分析...这可能需要一点时间。",
    cannotSave: "无法保存分析 - 请确保您已登录",
    alreadySaved: "分析已保存！",
    analysisSaved: "分析保存成功！",
    failedToSave: "保存分析失败。请重试。",

    // Theme toggle
    toggleTheme: "切换主题",
    light: "浅色",
    dark: "深色",
    system: "系统",

    // Language toggle
    toggleLanguage: "切换语言",
    english: "英语",
    malay: "马来语",
    chinese: "中文",

    // Additional Hero Section (for compatibility with Translations type)
    aiPoweredFactChecking: "AI驱动的可信度核查",
    tryExample: "尝试示例",
    analysisFailed: "分析失败。请重试。",
    overallVerification: "整体验证",
    analysis: "分析",
    showLess: "显示更少",
    showMore: "显示更多",
    sourcesFound: "找到来源",
    verifiedLabel: "已验证",
    yes: "是",
    no: "否",
    signInToSave: "登录以保存分析",
    analyzing2: "分析中...",
    transcriptionComplete: "转录完成",
    checkingFacts: "正在核查事实...",

    // News Page
    trendingOnCheckmate: "Checkmate 热门趋势",
    topCredibleSources: "最可信来源",
    topMisinformationSources: "主要错误信息来源",
    viewDetails: "查看详情",
    noCredibleSources: "尚未找到可信来源",
    noMisinformationSources: "尚未找到错误信息来源",

    // Creator Page
    highlyCredible: "高度可信",
    moderatelyCredible: "中等可信",
    lowCredibility: "低可信度",
    credibilityRating: "可信度评级",
    totalAnalyses: "总分析数",
    lastAnalyzed: "最后分析",
    analyses: "分析",
    contentAnalyses: "内容分析",
    noAnalysesFound: "尚未找到此创作者的分析。",
    untitledVideo: "无标题视频",
    rating: "评级",
    view: "查看",
    communityComments: "社区评论",
    shareThoughts: "分享您对此创作者的看法...",
    postComment: "发表评论",
    noCommentsYet: "还没有评论。成为第一个分享想法的人吧！",
    anonymous: "匿名",
    creatorNotFound: "创作者未找到",
    creatorNotFoundMessage: "未能找到。",

    // Analysis Page
    loadingAnalysis: "加载分析...",
    pleaseWait: "请稍候，我们正在获取详细信息。",
    analysisNotFound: "未找到分析",
    analysisNotFoundMessage: "请求的分析不存在或无法加载。",
    backToNews: "返回新闻",
    backToAllAnalyses: "返回所有分析",
    unknownCreator: "未知创作者",
    viewOriginalVideo: "查看原始视频",
    viewAuthor: "查看作者",
    language: "语言",
    contentAnalysis: "内容分析",
    factCheckResults: "事实核查结果",
    overallVerificationStatus: "整体验证状态",
    verifiedTrue: "已验证为真",
    needsVerification: "需要验证",
    claim: "声明：",
  },
};
