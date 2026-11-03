/**
 * CINEMATIC BIRTHDAY SURPRISE CONFIGURATION
 * Dedicated to Hnin Lae Yee (Baby / မနှင်းလေး) from Nyi Nyi ❤️
 * 
 * Supports Burmese (Primary/Default), English, Korean, and Chinese.
 * Fully customizable via Admin Settings.
 */

export type AppLanguage = 'my' | 'en' | 'ko' | 'zh';

export interface LocalizedString {
  my: string;
  en: string;
  ko: string;
  zh: string;
}

export interface Milestone {
  id: string;
  title: LocalizedString;
  tagline: LocalizedString;
  dateStr: string;
  description: LocalizedString;
  iconName: 'Sparkles' | 'Heart' | 'Cake' | 'Compass' | 'Camera' | 'Sun';
  photoUrl?: string;
}

export interface JourneySectionConfig {
  sectionTag: LocalizedString;
  sectionTitle: LocalizedString;
  counterSuffix: LocalizedString;
  counterSubtext: LocalizedString;
}

export interface MoonWhisper {
  text: LocalizedString;
}

export interface LoveScrollWish {
  id: string;
  text: LocalizedString;
}

export interface BirthdayConfig {
  girlfriendName: string;
  nickname: string;
  nicknameBurmese?: string;
  boyfriendName: string;
  birthday: string; // YYYY-MM-DD
  celebrationDate: string; // YYYY-MM-DD
  relationshipDurationDays: number;
  relationshipStartDate: string; // YYYY-MM-DD (2024-05-24)
  passcode: string;
  passcodeHint: LocalizedString;
  audioTrackUrl?: string;
  birdsongEnabled?: boolean;
  birdsongVolume?: number;

  // LoveScroll Marquee Wishes
  loveScrollEnabled?: boolean;
  loveScrollWishes?: LoveScrollWish[];

  // Scene 1: Entrance
  entranceGreeting: LocalizedString;
  entranceWelcome: LocalizedString;
  entranceButtonText: LocalizedString;

  // Scene 2: Password Gate
  gateQuestion: LocalizedString;
  gateSubtitle: LocalizedString;
  gateButtonText: LocalizedString;
  gateHintButtonText: LocalizedString;
  gateErrorPrefix: LocalizedString;

  // Scene 3: Birthday Celebration
  celebrationTitle: LocalizedString;
  celebrationSubtitle: LocalizedString;
  cakeButtonText: LocalizedString;
  cakeWishWhisper: LocalizedString;
  cakeWishMessage: LocalizedString;
  readLetterButtonText: LocalizedString;

  // Scene 4: Love Letter
  letterTitle: LocalizedString;
  letterSubtitle: LocalizedString;
  letterContent: LocalizedString;
  letterExploreButtonText: LocalizedString;

  // Scene 5: Timeline / Journey
  journeyConfig: JourneySectionConfig;
  milestones: Milestone[];

  // Scene 6: Star Gazing
  starsTitle: LocalizedString;
  starsQuote: LocalizedString;
  starsSubtitle: LocalizedString;
  moonTapPrompt: LocalizedString;
  moonWhispers: MoonWhisper[];
  starsNextButtonText: LocalizedString;

  // Scene 8: Final Surprise
  finalChapterTag: LocalizedString;
  finalSurprisePrompt: LocalizedString;
  openGiftButtonText: LocalizedString;
  finalMessage: LocalizedString;
  signature: LocalizedString;
  replayButtonText: LocalizedString;
}

export const initialBirthdayConfig: BirthdayConfig = {
  girlfriendName: "Hnin Lae Yee",
  nickname: "Baby",
  nicknameBurmese: "မနှင်းလေး",
  boyfriendName: "Nyi Nyi",
  birthday: "1996-11-09",
  celebrationDate: "2026-11-09",
  relationshipDurationDays: 899,
  relationshipStartDate: "2024-05-24", // May 24, 2024 -> Nov 9, 2026 is exactly 899 days!
  passcode: "2405",
  audioTrackUrl: "",
  birdsongEnabled: true,
  birdsongVolume: 0.35,

  loveScrollEnabled: true,
  loveScrollWishes: [
    {
      id: "wish-1",
      text: {
        my: "မနှင်းလေးရဲ့ အသက် (၃၀) ပြည့် မွေးနေ့မှသည် နောင်နှစ်ပေါင်းများစွာတိုင် ထာဝရချစ်ခြင်းတွေနဲ့ ပျော်ရွှင်ပါစေ 🎂❤️",
        en: "Happy 30th Birthday to my sweetest baby, Hnin Lae Yee! Forever and always in my heart 🎂❤️",
        ko: "내 가장 사랑하는 흐닌래이(Baby), 30번째 생일을 진심으로 축하해! 🎂❤️",
        zh: "祝我最亲爱的宝贝（မနှင်းလေး）30岁生日快乐！愿你永远幸福美丽 🎂❤️"
      }
    },
    {
      id: "wish-2",
      text: {
        my: "တို့နှစ်ယောက် လက်တွဲခဲ့တာ ၈၉၉ ရက်တိုင်ခဲ့ပြီ... နေ့ရက်တိုင်း မနှင်းလေးကို ပိုပိုချစ်မိတယ် 🌸💍",
        en: "899 days holding your hand, and I love you deeper with every sunrise 🌸💍",
        ko: "함께 손잡고 걸어온 899일... 매일매일 당신을 더 깊이 사랑해요 🌸💍",
        zh: "牵手相伴899天，每一个清晨我都比昨天更爱你 🌸💍"
      }
    },
    {
      id: "wish-3",
      text: {
        my: "နီနီ့ရဲ့ ကမ္ဘာငယ်လေးထဲ အလင်းရောင်တွေ ယူဆောင်လာပေးလို့ ကျေးဇူးအများကြီးတင်ပါတယ် ချစ်ရသူလေးရေ ✨💕",
        en: "Thank you for bringing so much radiant warmth and joy into my life, my love ✨💕",
        ko: "내 세상에 눈부신 빛과 행복을 선물해 줘서 고마워요, 내 사랑 ✨💕",
        zh: "谢谢你走进我的世界，为我带来所有的温柔与光明 ✨💕"
      }
    },
    {
      id: "wish-4",
      text: {
        my: "မနှင်းလေး လိုချင်တဲ့ အိပ်မက်တွေ၊ ဆုတောင်းတွေ အားလုံး တစ်ခုမကျန် ပြည့်စုံပါစေ 🌟🌹",
        en: "May every single wish, prayer, and secret dream of yours blossom into reality 🌟🌹",
        ko: "당신이 품은 모든 소망과 예쁜 꿈들이 눈부시게 이루어지길 바라요 🌟🌹",
        zh: "愿你心中的每一个美好心愿都在这一年如繁花盛开 🌟🌹"
      }
    },
    {
      id: "wish-5",
      text: {
        my: "အမြဲတမ်း မျက်နှာလေးမှာ အပြုံးချိုချိုလေးတွေ ဝေဆာနေပါစေ... နီနီ ထာဝရ အနားမှာ ရှိနေပေးမယ်နော် 💖🕊️",
        en: "May your sweet face always shine with pure smiles... Nyi Nyi will forever be by your side 💖🕊️",
        ko: "언제나 그 예쁜 얼굴에 환한 미소만 가득하길... 영원히 곁을 지킬게요 💖🕊️",
        zh: "愿你那温柔的脸庞永远盛满微笑... 尼尼会一直在你身边守护你 💖🕊️"
      }
    }
  ],

  passcodeHint: {
    my: "တို့နှစ်ယောက်ရဲ့ နှစ်ပတ်လည်နေ့စွဲ (၂၄ ရက်၊ ၅ လပိုင်း)",
    en: "Our anniversary date & month (DDMM: 24th of May)",
    ko: "우리의 기념일 날짜와 월 (24일 5월)",
    zh: "我们的恋爱纪念日与月份（5月24日）"
  },

  // Scene 1
  entranceGreeting: {
    my: "ဒီမိုးပြာရောင်ကောင်းကင်အောက်... မနှင်းလေး တစ်ယောက်တည်းအတွက်ပဲ ဖူးပွင့်နေတဲ့ ပန်းဥယျာဉ်လေးတစ်ခု ရှိတယ်။",
    en: "Beneath this endless sky blue horizon, blooms a secret garden created just for you.",
    ko: "눈부신 푸른 하늘 아래, 오직 당신만을 위해 피어난 비밀의 정원이 있어요.",
    zh: "在蔚蓝的天空之下，盛开着一座只为你而存在的秘密花海。"
  },
  entranceWelcome: {
    my: "မနှင်းလေးရဲ့ အချစ်ပန်းဥယျာဉ်လေးမှ ကြိုဆိုပါတယ် 🌸",
    en: "Welcome to Your Secret Garden, Baby 🌸",
    ko: "당신만의 비밀 정원에 오신 걸 환영해요, 내 사랑 🌸",
    zh: "欢迎来到属于你的秘密花海，宝贝 🌸"
  },
  entranceButtonText: {
    my: "ကိုယ့်နှလုံးသားထဲ ဝင်ရောက်ပါ",
    en: "Enter My Heart",
    ko: "내 마음속으로 들어오기",
    zh: "走进我的心里"
  },

  // Scene 2
  gateQuestion: {
    my: "ဒီနှလုံးသားတံခါးကို ဖွင့်ဖို့အတွက် မေးခွန်းလေးတစ်ခု ဖြေပေးပါ မနှင်းလေး...",
    en: "Before you enter, answer one little question, Baby...",
    ko: "들어가기 전에, 한 가지 질문에 답해줘요, 내 사람...",
    zh: "在打开心门之前，请回答这道甜蜜的小问题，宝贝……"
  },
  gateSubtitle: {
    my: "တို့နှစ်ယောက်ရဲ့ သီးသန့် လျှို့ဝှက်ကုဒ်လေးကို ရိုက်ထည့်ပေးပါနော်။",
    en: "Enter the secret passcode that belongs only to us.",
    ko: "우리 둘만의 비밀 암호를 입력해 주세요.",
    zh: "请输入只属于我们两个人之间的专属密语。"
  },
  gateButtonText: {
    my: "နှလုံးသားတံခါးကို ဖွင့်ပါ ❤️",
    en: "Unlock My Heart ❤️",
    ko: "내 마음의 문 열기 ❤️",
    zh: "开启心门 ❤️"
  },
  gateHintButtonText: {
    my: "သဲလွန်စလေး လိုချင်ပါသလား မနှင်းလေး?",
    en: "Need a little hint, Baby?",
    ko: "작은 힌트가 필요하신가요, 내 사랑?",
    zh: "需要一点小提示吗，宝贝？"
  },
  gateErrorPrefix: {
    my: "နီးစပ်သွားပြီ မနှင်းလေးရေ! ❤️ သဲလွန်စ: ",
    en: "Almost there, Baby! ❤️ Hint: ",
    ko: "거의 다 맞췄어요, 내 사람! ❤️ 힌트: ",
    zh: "就差一点点啦，宝贝！❤️ 提示："
  },

  // Scene 3
  celebrationTitle: {
    my: "မွေးနေ့မှာ ပျော်ရွှင်ပါစေ မနှင်းလေး! ❤️",
    en: "Happy Birthday, Baby! ❤️",
    ko: "생일 축하해요, 내 사랑! ❤️",
    zh: "生日快乐，宝贝！❤️"
  },
  celebrationSubtitle: {
    my: "ဒီနေ့ဟာ ကမ္ဘာပေါ်မှာ အလှဆုံးနဲ့ အထူးခြားဆုံး မနှင်းလေး မွေးဖွားလာခဲ့တဲ့ နေ့ရက်ပါပဲ။",
    en: "Today, the universe celebrates the day someone incredibly special was born.",
    ko: "오늘, 온 우주가 세상에서 가장 특별하고 눈부신 사람이 태어난 날을 축하해요.",
    zh: "今天，整个宇宙都在庆祝一个无比珍贵且闪闪发亮的人的诞生。"
  },
  cakeButtonText: {
    my: "ဆုတောင်းလိုက်ပါ မနှင်းလေး",
    en: "Make a Wish, Baby",
    ko: "소원을 빌어봐요, 내 사랑",
    zh: "许个愿吧，宝贝"
  },
  cakeWishWhisper: {
    my: "မနှင်းလေးရဲ့ ဆုတောင်းသံကို ကြယ်တာရာလေးတွေဆီ ပို့လိုက်ပါပြီ ✨",
    en: "Your wish has been whispered to the stars ✨",
    ko: "당신의 소원이 별빛에게 전해졌어요 ✨",
    zh: "你的心愿已被星光轻声倾听 ✨"
  },
  cakeWishMessage: {
    my: "မနှင်းလေး ရင်ထဲက ဆုတောင်းတိုင်း ပြည့်စုံပါစေ။ မွေးနေ့မှာ ပျော်ရွှင်ပါစေ ချစ်ရသူလေးရေ!",
    en: "May every dream you hold in your heart come true this year, my love. Happy Birthday!",
    ko: "가슴속에 품은 모든 꿈이 이루어지길 바라요, 내 사랑. 생일 축하해요!",
    zh: "愿你心底所期盼的美好都能如期而至，我的挚爱。生日快乐！"
  },
  readLetterButtonText: {
    my: "ညီညီ့ရဲ့ ချစ်မေတ္တာစာလွှာ ဖတ်ရန် 💌",
    en: "Read Nyi Nyi's Love Letter 💌",
    ko: "ညီညီ (Nyi Nyi)의 사랑 편지 읽기 💌",
    zh: "拆读 ညီညီ (Nyi Nyi) 的手写情书 💌"
  },

  // Scene 4: Love Letter
  letterTitle: {
    my: "မနှင်းလေး အတွက် ရင်ဖွင့်စာလွှာ",
    en: "A Letter From My Heart",
    ko: "마음 깊은 곳에서 보내는 편지",
    zh: "致我心爱的宝贝"
  },
  letterSubtitle: {
    my: "ချစ်ရသော မနှင်းလေးဆီသို့",
    en: "For You, Baby",
    ko: "오직 당신만을 위하여",
    zh: "写给你，唯一的你"
  },
  letterContent: {
    my: `ချစ်ရပါသော ကိုယ့်ရဲ့ မနှင်းလေး...

မွေးနေ့မှာ ပျော်ရွှင်ပါစေ အချစ်ဆုံးလေးရေ။ ❤️

ဒီနေ့ဟာ ကိုယ့်ဘဝထဲကို ပျော်ရွှင်မှုတွေ ယူဆောင်လာပေးခဲ့တဲ့ အလှပဆုံးသော မနှင်းလေးအတွက် အထူးခြားဆုံးနေ့ရက်လေးပါပဲ။

မင်းကို ကိုယ့်မျက်လုံးတွေနဲ့သာ ပြန်ကြည့်ခွင့်ပေးနိုင်မယ်ဆိုရင် ကိုယ့်အတွက် မနှင်းလေး ဘယ်လောက်တောင် အဖိုးတန်တယ်ဆိုတာ သိနိုင်မှာပါ။

ကိုယ့်ဘေးမှာရှိပေးခဲ့တဲ့ အမှတ်တရတိုင်းအတွက် ကျေးဇူးအများကြီးတင်ပါတယ် မနှင်းလေးရယ်။ မင်းလေးရှိနေပေးတာနဲ့တင် အချိန်တိုင်းဟာ တန်ဖိုးရှိနေပါပြီ။

မင်းရဲ့ မွေးနေ့မှာ ပျော်ရွှင်ချမ်းမြေ့ခြင်း၊ အေးချမ်းခြင်းတွေနဲ့အတူ ဆုတောင်းတိုင်း ပြည့်စုံပါစေလို့ ဆုတောင်းပေးပါတယ်။

အလှပဆုံးနေရာတွေကို မင်းနဲ့အတူ လျှောက်သွားချင်တယ်၊ နေဝင်ဆည်းဆာတွေကို အတူကြည့်ချင်တယ်၊ နှစ်ပေါင်းများစွာကြာတဲ့အထိ ပြုံးပြုံးလေးပြန်ပြောလို့ရမယ့် အမှတ်တရကောင်းတွေကို မင်းနဲ့အတူတူ ဆက်ပြီးဖန်တီးသွားချင်တယ်။

ကမ္ဘာကြီး ဘယ်လိုပဲပြောင်းလဲပါစေ... တို့နှစ်ယောက်ရဲ့ အပြုံးလေးတွေနဲ့ လက်တွဲမဖြုတ်ဘဲ အတူတူဆက်လျှောက်ကြမယ်နော်။

မွေးနေ့မှာ ပျော်ရွှင်ပါစေ ချစ်သူလေး။

ချစ်ခြင်းများစွာဖြင့်... မင်းရဲ့ ညီညီ ❤️`,

    en: `My Baby, Hnin Lae Yee,

Happy Birthday, my love. ❤️

Today is all about you, the beautiful person who has brought so much happiness into my life.

If I could give you one thing today, I would give you the chance to see yourself through my eyes. Maybe then you would understand how special you are to me.

Thank you for being part of my journey, for the memories we have created, and for every little moment that has become precious simply because you were there.

On your birthday, I wish you a life filled with happiness, peaceful days, beautiful adventures, and dreams that come true.

I hope we get to explore beautiful places together, watch countless sunsets, take pictures of our favorite moments, and create memories that we will smile about for years to come.

I cannot promise that every day will be perfect, but I hope to keep learning, growing, and making beautiful memories with you.

No matter how much the world changes, I hope we never stop finding little reasons to smile together.

Happy Birthday, Baby.

With all my love, Your Nyi Nyi ❤️`,

    ko: `사랑하는 내 사람, 흐닌 래 ရီ (Baby),

생일 진심으로 축하해요, 내 사랑. ❤️

오늘은 내 삶에 수많은 행복과 미소를 안겨준 가장 아름다운 당신만을 위한 날이에요.

오늘 내가 당신에게 단 한 가지를 선물할 수 있다면, 내 눈을 통해 당신 자신을 바라볼 수 있는 순간을 주고 싶어요. 그렇다면 당신이 내게 얼마나 둘도 없이 소중한 존재인지 알 수 있을 텐데 말이에요.

내 인생의 여정에 함께해 주고, 우리가 함께 만든 수많은 추억들과 당신이 곁에 있어 준 모든 작은 순간들에 진심으로 감사해요.

생일을 맞아 평화로운 나날들과 가슴 뛰는 모험, 그리고 마음속에 품은 모든 꿈이 찬란하게 이루어지길 소망해요.

함께 눈부시게 아름다운 곳들을 여행하고, 끝없는 노을을 바라보며, 먼 훗날에도 미소 지을 수 있는 따뜻한 기억들을 계속 써 내려가고 싶어요.

세상이 아무리 변한다 해도, 우리가 서로를 바라보며 미소 짓는 작은 이유들을 영원히 잃지 않기를.

생일 축하해요, 내 사랑.

온 마음을 다해 사랑을 담아, 당신의 ညီညီ (Nyi Nyi)가 ❤️`,

    zh: `我最亲爱的宝贝，

生日快乐，我的爱。❤️

今天的一切都只属于你——这个为我的生命带来无尽温暖与欢笑的珍贵女孩。

如果今天我能送你一份奇迹般的礼物，我多么希望能让你透过我的双眼看见你自己。或许唯有那样，你才会真正明白你在我生命中是多么无可替代。

感谢你陪伴我走过这趟人生旅途，感谢我们共同谱写的美好回忆，更感谢每一个只因有你而在就变得格外闪耀的温柔日常。

在这个特别的日子里，我祝愿你的生活被平安、喜乐与美好所环绕，所有深藏在心底的梦想都能悄然盛开。

希望能与你走遍更多风景，并肩看过无数个动人的日落，在未来的岁月长河里，留下更多让我们回想起来便忍不住微笑的足迹。

无论时光如何流转，愿我们永远都有相伴同行、相视而笑的甜蜜与从容。

生日快乐，我的宝贝。

永远爱你的 ညီညီ (Nyi Nyi) ❤️`
  },
  letterExploreButtonText: {
    my: "တို့နှစ်ယောက်ရဲ့ အမှတ်တရခရီးစဉ် ❤️",
    en: "Explore Our Little Story ❤️",
    ko: "우리의 소중한 이야기 보기 ❤️",
    zh: "重温我们的甜蜜故事 ❤️"
  },

  // Scene 5: Timeline & Custom Journey Settings
  journeyConfig: {
    sectionTag: {
      my: "တို့နှစ်ယောက်ရဲ့ အတူတူ လျှောက်လှမ်းခဲ့သော ခရီး",
      en: "Our Journey Together",
      ko: "우리가 함께 걸어온 길",
      zh: "我们携手走过的时光"
    },
    sectionTitle: {
      my: "တို့နှစ်ယောက်ရဲ့ အမှတ်တရဇာတ်လမ်းလေး ❤️",
      en: "Our Little Story ❤️",
      ko: "우리 둘만의 작은 동화 ❤️",
      zh: "关于我们的心动轨迹 ❤️"
    },
    counterSuffix: {
      my: "ရက်တာ တို့နှစ်ယောက် လက်တွဲခဲ့ကြပြီ",
      en: "Days of Us",
      ko: "일간의 우리 이야기",
      zh: "天的相爱相守"
    },
    counterSubtext: {
      my: "တို့နှစ်ယောက်ရဲ့ နှစ်ပတ်လည်နေ့မှသည် မွေးနေ့အထိ",
      en: "From our anniversary to your birthday",
      ko: "우리의 기념일부터 당신의 생일까지",
      zh: "从相爱纪念日到专属你的生日"
    }
  },

  milestones: [
    {
      id: "beginning",
      title: {
        my: "တို့နှစ်ယောက်ရဲ့ အစပြုခြင်း",
        en: "The Beginning",
        ko: "우리의 시작",
        zh: "初遇的心动"
      },
      tagline: {
        my: "လှပတဲ့ ဇာတ်လမ်းတိုင်းဟာ တိုက်ဆိုင်မှုအခိုက်အတန့်လေးတစ်ခုနဲ့ စတင်ခဲ့တယ်။",
        en: "Every beautiful story begins with a moment.",
        ko: "모든 아름다운 이야기는 작은 한순간에서 시작돼요.",
        zh: "所有美好的故事，都始于那个注定的瞬间。"
      },
      dateStr: "May 24, 2024",
      description: {
        my: "တို့နှစ်ယောက် စတင်တွေ့ဆုံခဲ့ပြီး နှလုံးသားနှစ်ခု ပေါင်းစည်းခဲ့တဲ့ အမှတ်တရနေ့ရက်လေး။ တိတ်ဆိတ်တဲ့ အလင်းစက်လေးကနေ အရာအားလုံး စတင်ခဲ့တယ်။",
        en: "The moment our paths crossed and two hearts began writing a shared story. A quiet spark that changed everything.",
        ko: "우리의 길이 닿아 두 마음이 하나의 이야기를 쓰기 시작한 그 순간. 모든 것을 바꾼 따스한 시작이었어요.",
        zh: "当我们的轨迹相交，两颗心便悄然写下共同的篇章。那一抹温柔的火花，照亮了往后的时光。"
      },
      iconName: "Sparkles"
    },
    {
      id: "journey",
      title: {
        my: "အတူတူ လျှောက်လှမ်းခဲ့တဲ့ နေ့ရက်များ",
        en: "Our Journey",
        ko: "함께한 날들",
        zh: "相伴的旅程"
      },
      tagline: {
        my: "သေးငယ်တဲ့ အခိုက်အတန့်လေးတွေကနေ တန်ဖိုးမဖြတ်နိုင်တဲ့ အမှတ်တရတွေ ဖြစ်လာခဲ့တယ်။",
        en: "Little moments can become the memories we treasure most.",
        ko: "소소한 순간들이 모여 가장 소중한 추억이 되었어요.",
        zh: "点点滴滴的平凡瞬间，沉淀为心底最珍贵的宝藏。"
      },
      dateStr: "899 Days of Growing Together",
      description: {
        my: "ရယ်မောသံတွေ၊ ညနက်သန်းခေါင် စကားဝိုင်းလေးတွေနဲ့ တစ်ယောက်ကိုတစ်ယောက် နားလည်ဖေးမရင်း ဖြတ်သန်းခဲ့ကြတဲ့ နေ့ရက်တွေ။",
        en: "Sharing laughter, late-night talks, supporting each other through every mood, and creating our own comfortable safe haven.",
        ko: "함께 웃고, 밤새 이야기를 나누며, 서로의 곁에서 아늑하고 편안한 안식처를 만들어온 소중한 시간들.",
        zh: "肆意的欢笑、深夜的长谈、互为依靠的每一次起落，将彼此筑成了最温暖踏实的避风港。"
      },
      iconName: "Heart"
    },
    {
      id: "today",
      title: {
        my: "ဒီနေ့ · မင်းရဲ့ မွေးနေ့",
        en: "Today · Birthday",
        ko: "오늘 · 당신의 생일",
        zh: "今日 · 属于你的生日"
      },
      tagline: {
        my: "မင်းလေးရဲ့ အလှတရားတွေနဲ့ အိမ်မက်တွေကို အတူတူဂုဏ်ပြုကြိုဆိုတဲ့နေ့။",
        en: "Celebrating you, your dreams, and the beautiful person you are.",
        ko: "당신과, 당신의 꿈과, 눈부신 존재 자체를 축하하는 날.",
        zh: "为你、为你的梦想、以及独一无二美好的你举杯庆祝。"
      },
      dateStr: "November 9, 2026",
      description: {
        my: "မင်းဘေးမှာ အမြဲတမ်းရှိနေမယ့် ကိုယ့်ရဲ့ အချစ်ဆုံး မွေးနေ့ရှင် မနှင်းလေး။ အလင်းရောင်တွေ ယူဆောင်လာပေးတဲ့ မင်းလေးကို အမြဲတမ်း ချစ်နေမှာပါ။",
        en: "Celebrating another radiant year of your life. Bringing light to everyone around you, especially to the boy who loves you most.",
        ko: "주변의 모든 이들에게, 그리고 당신을 가장 사랑하는 나에게 따뜻한 빛이 되어주는 당신의 생일을 축하해요.",
        zh: "庆祝你生命中又一个灿烂年华。感谢你像一道光照亮了周围，更照亮了那个深爱你的男孩。"
      },
      iconName: "Cake"
    },
    {
      id: "future",
      title: {
        my: "တို့နှစ်ယောက်ရဲ့ အနာဂတ်နေ့ရက်များ",
        en: "Our Future",
        ko: "우리의 내일",
        zh: "未来的星辰大海"
      },
      tagline: {
        my: "သွားစရာနေရာတွေ အများကြီး၊ ကြည့်စရာ နေဝင်ဆည်းဆာတွေ အများကြီးနဲ့ အတူတူ ဆက်သွားကြမယ်။",
        en: "More places to explore, more sunsets to watch, and more memories to create together.",
        ko: "함께 갈 곳도, 함께 볼 노을도, 새로이 써 내려갈 추억도 무수히 많아요.",
        zh: "还有更多美景等待探索，更多日落值得并肩凝望，更多回忆等待共同创造。"
      },
      dateStr: "Forever & Beyond",
      description: {
        my: "တို့နှစ်ယောက် အတူတူ ရေးသားရဦးမယ့် ရှေ့ဆက်အခန်းတွေမှာလည်း မင်းလက်ကို မြဲမြဲဆုပ်ကိုင်ထားမှာပါ။",
        en: "Countless adventures waiting ahead of us. New countries, cozy mornings, and writing every next chapter side-by-side.",
        ko: "우리 앞에 펼쳐질 무수한 모험들. 새로운 풍경, 포근한 아침, 그리고 나란히 채워갈 다음 챕터들.",
        zh: "无数精彩的冒险还在前方静待。探索崭新的国度、享受恬静的清晨，彼此依偎书写往后的每一章。"
      },
      iconName: "Sun"
    }
  ],

  // Scene 6: Star & Garden Whispers
  starsTitle: {
    my: "မိုးပြာရောင်ကောင်းကင်နှင့် မေပယ်လ်ဥယျာဉ်အောက်ဝယ်",
    en: "Beneath The Sky Blue & Maple Garden",
    ko: "푸른 하늘과 단풍잎 정원 아래서",
    zh: "蔚蓝天空与枫叶花海之下"
  },
  starsQuote: {
    my: "ဒီကျယ်ပြောတဲ့ ကောင်းကင်ကြီးအောက်မှာ... ကိုယ်အနှစ်သက်ဆုံး နေရာတစ်ခုဟာ မနှင်းလေးနဲ့အတူ ရှိနေခွင့်ရတဲ့ အခိုက်အတန့်လေးပါပဲ။",
    en: "Somewhere beneath this endless sky, my favorite place will always be wherever I can share a moment with you.",
    ko: "이 끝없는 밤하늘 아래, 내가 가장 좋아하는 곳은 언제나 당신과 함께 머무는 그 순간이에요.",
    zh: "在这片无垠的星空之下，我最心驰神往的港湾，永远是能与你相伴相随的每一个瞬间。"
  },
  starsSubtitle: {
    my: "ဆုတောင်းလိုက်ပါ မနှင်းလေး။ ပန်းဥယျာဉ်လေးက နားထောင်နေတယ် 🌸",
    en: "Make a wish, Baby. The garden is listening. 🌸",
    ko: "소원을 빌어봐요, 내 사랑. 꽃들의 정원이 귀 기울이고 있어요. 🌸",
    zh: "许个愿吧，宝贝。花海与微风正为你倾听。🌸"
  },
  moonTapPrompt: {
    my: "ဆုတောင်းပန်းပွင့်လေးကို နှိပ်ပြီး စကားသံနားထောင်ပါ 🌸",
    en: "Tap Wishing Flower for a Sweet Whisper 🌸",
    ko: "소원의 꽃을 터치해 속삭임을 들어보세요 🌸",
    zh: "轻触愿望花朵倾听甜蜜心语 🌸"
  },
  moonWhispers: [
    {
      text: {
        my: "မိုးပြာရောင်ကောင်းကင်ကို ကြည့်မိတိုင်း မင်းမျက်ဝန်းလေးတွေရဲ့ တောက်ပမှုကို သတိရမိတယ် မနှင်းလေးရယ်။ ✨",
        en: "Baby, every time I look at this azure sky, I'm reminded of the gentle sparkle in your eyes. ✨",
        ko: "푸른 하늘을 올려다볼 때마다 당신의 두 눈에 어린 고운 반짝임이 떠올라요, 내 사랑. ✨",
        zh: "宝贝，每当我凝望碧蓝苍穹，眼前总会浮现你眼眸里那抹清澈璀璨的光芒。✨"
      }
    },
    {
      text: {
        my: "ရိုးရှင်းတဲ့ နေ့ရက်တိုင်းကိုတောင် မနှင်းလေးက နိုးမထချင်တဲ့ အိမ်မက်လှလှလေးတစ်ခုလို ဖြစ်စေခဲ့တယ်။ ❤️",
        en: "You make the ordinary days feel like a dream I never want to wake up from. ❤️",
        ko: "평범했던 일상조차 영원히 깨어나고 싶지 않은 달콤한 꿈으로 만들어준 당신이에요. ❤️",
        zh: "平凡的每一寸光阴，都因你的出现变成了我不愿醒来的温柔美梦。❤️"
      }
    },
    {
      text: {
        my: "မနှင်းလေးနဲ့အတူ ဖြတ်သန်းခဲ့တဲ့ ၈၉၉ ရက်တာဟာ တို့နှစ်ယောက် တစ်သက်တာရဲ့ အစပဲ ရှိပါသေးတယ်။ 🌸",
        en: "899 days with you feels like just the sweet beginning of our lifetime. 🌸",
        ko: "당신과 함께한 899일은 우리 평생의 다정한 시작에 불과해요. 🌸",
        zh: "与你相依相伴的这899天，不过是我们漫长一生中最甘甜的序章。🌸"
      }
    },
    {
      text: {
        my: "ကိုယ့်အတွက် နွေးထွေးမှု၊ အနားယူရာနဲ့ အနှစ်သက်ဆုံး အိမ်ကလေး ဖြစ်ပေးလို့ ကျေးဇူးပါ မနှင်းလေး။ 🥰",
        en: "Thank you for being my warmth, my comfort, and my favorite home. 🥰",
        ko: "나의 따스함이 되어주고, 쉼터가 되어주며, 세상에서 가장 아늑한 집이 되어주어 고마워요. 🥰",
        zh: "谢谢你做我的避风港、我的安乐乡，以及这纷繁世界上我最眷恋的心灵家园。🥰"
      }
    },
    {
      text: {
        my: "မနှင်းလေးရဲ့ နှလုံးသားလေးဟာလည်း ဒီပန်းဥယျာဉ်လေးလို အမြဲတမ်း အေးချမ်းကြည်လင်ပါစေ။ 🌸",
        en: "May your heart always be as beautiful and vibrant as this blooming garden. 🌸",
        ko: "당신의 마음이 언제나 이 꽃들의 정원처럼 눈부시고 향기롭기를 바라요. 🌸",
        zh: "愿你的心灵永远如这繁花盛开的花园般温润明媚，被幸福紧紧包围。🌸"
      }
    }
  ],
  starsNextButtonText: {
    my: "နောက်ဆုံး လက်ဆောင်လေးတစ်ခု ရှိသေးတယ် 🎁",
    en: "One Final Surprise for Baby 🎁",
    ko: "내 사랑을 위한 마지막 깜짝 선물 🎁",
    zh: "为宝贝准备的最后一份心动惊喜 🎁"
  },

  // Scene 8: Final Surprise
  finalChapterTag: {
    my: "အချစ်ဆုံး မနှင်းလေးဆီသို့",
    en: "The Final Chapter",
    ko: "마지막 장",
    zh: "最终章 · 永恒承诺"
  },
  finalSurprisePrompt: {
    my: "မနှင်းလေးအတွက် ကိုယ့်ရင်ထဲက နောက်ဆုံးလက်ဆောင်လေးတစ်ခု ကျန်သေးတယ်...",
    en: "Baby, I have one more little surprise for you...",
    ko: "내 사람, 당신만을 위한 작은 선물이 하나 더 남아있어요...",
    zh: "宝贝，在我心里还藏着最后一份属于你的甜蜜惊喜……"
  },
  openGiftButtonText: {
    my: "လက်ဆောင်ဘူးလေးကို ဖွင့်ပါ မနှင်းလေး ❤️",
    en: "Tap to Open Your Gift, Baby ❤️",
    ko: "선물 상자를 열어보세요, 내 사랑 ❤️",
    zh: "轻触拆开你的专属心意礼物，宝贝 ❤️"
  },
  finalMessage: {
    my: `ဒီကမ္ဘာပေါ်မှာ လှပတဲ့အရာပေါင်း တစ်ထောင်ကို ရွေးချယ်ခွင့်ရရင်တောင်... ကိုယ့်ဘဝထဲ မနှင်းလေး ရောက်လာခဲ့တာကိုပဲ အမြဲတမ်း ကျေးဇူးတင်နေမိမှာပါ။

မွေးနေ့မှာ ပျော်ရွှင်ပါစေ မနှင်းလေး...

မင်းရဲ့ နှလုံးသားထဲက အိမ်မက်တွေအတိုင်း မင်းရဲ့ ဘဝခရီးလမ်းလေးဟာ လှပနေပါစေ။

ဘဝက တို့နှစ်ယောက်ကို နောက်ထပ် အခန်းသစ်တွေ ရေးခွင့်ပေးခဲ့ရင်လည်း အကောင်းဆုံး အမှတ်တရတွေကို မင်းနဲ့အတူတူ ဆက်ပြီးဖန်တီးခွင့်ရချင်ပါတယ်။

အမြဲတမ်း မင်းရဲ့ ညီညီ... ❤️`,

    en: `If I could choose a thousand beautiful things in this world, I would still be grateful that our paths crossed.

Happy Birthday, Hnin Lae Yee.

May your life be as beautiful as the dreams you carry in your heart.

And if life gives us many more chapters to write, I hope we get to create some of our favorite memories together.

Forever your Nyi Nyi. ❤️`,

    ko: `이 세상의 수천 가지 아름다운 것들 중 선택할 수 있다 해도, 우리 두 사람의 길이 닿았던 그 순간에 언제나 가장 깊이 감사할 거예요.

생일 축하해요, 내 사랑.

당신의 삶이 가슴속에 품은 고운 꿈만큼 아름답게 빛나기를.

그리고 삶이 우리에게 더 많은 새로운 챕터를 허락한다면, 가장 눈부신 추억들을 당신과 함께 만들어가고 싶어요.

영원히 당신 곁에, ညီညီ (Nyi Nyi)가. ❤️`,

    zh: `即使能在这世上挑选千百种令人心动的璀璨事物，我也依旧会满心感激命运让我们相遇相知。

生日快乐，我挚爱的宝贝。

愿你的生命如你心底所珍藏的所有美梦一样绚烂多姿。

若时光赐予我们更多书写未来的章节，我愿与你并肩携手，继续创造更多此生难忘的珍贵回忆。

永远守护你的 ညီညီ (Nyi Nyi)。❤️`
  },
  signature: {
    my: "မနှင်းလေး အတွက် ချစ်ခြင်းများစွာဖြင့် ဖန်တီးထားပါသည် ❤️",
    en: "Made with Love, Just for Baby ❤️",
    ko: "오직 내 사랑을 위해 사랑을 담아 제작되었습니다 ❤️",
    zh: "倾注全部心意与爱意，只为你而作 ❤️"
  },
  replayButtonText: {
    my: "အစကနေ ပြန်လည်ကြည့်ရှုရန်",
    en: "Experience It Again",
    ko: "처음부터 다시 보기",
    zh: "再次重温这段旅程"
  }
};

/**
 * Calculates current days together from relationship start date dynamically,
 * or falls back to the configured relationshipDurationDays if no start date.
 */
export function calculateDaysTogether(startDateStr?: string, defaultDays: number = 899): number {
  if (!startDateStr) return defaultDays;
  try {
    const start = new Date(startDateStr);
    const target = new Date("2026-11-09"); // Celebration date
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : defaultDays;
  } catch {
    return defaultDays;
  }
}

/**
 * Replaces nicknames across all messages and letters dynamically
 */
export function replaceNicknameEverywhere(
  config: BirthdayConfig,
  newNickname: string,
  newBurmeseNickname?: string
): BirthdayConfig {
  const burmeseNick = (newBurmeseNickname !== undefined && newBurmeseNickname.trim() !== '')
    ? newBurmeseNickname.trim()
    : config.nicknameBurmese || 'မနှင်းလေး';
  const engNick = (newNickname !== undefined && newNickname.trim() !== '')
    ? newNickname.trim()
    : config.nickname || 'Baby';
  const oldBurmese = config.nicknameBurmese || 'မနှင်းလေး';
  const oldEng = config.nickname || 'Baby';

  const replaceInStr = (str: string, isBurmese: boolean): string => {
    if (!str) return str;
    let res = str;
    if (isBurmese) {
      if (oldBurmese && burmeseNick && oldBurmese !== burmeseNick) {
        res = res.split(oldBurmese).join(burmeseNick);
      }
    } else {
      if (oldEng && engNick && oldEng !== engNick) {
        res = res.split(oldEng).join(engNick);
      }
    }
    return res;
  };

  const replaceInLoc = (loc: LocalizedString): LocalizedString => ({
    my: replaceInStr(loc.my, true),
    en: replaceInStr(loc.en, false),
    ko: loc.ko,
    zh: loc.zh,
  });

  return {
    ...config,
    nickname: engNick,
    nicknameBurmese: burmeseNick,
    entranceGreeting: replaceInLoc(config.entranceGreeting),
    entranceWelcome: replaceInLoc(config.entranceWelcome),
    entranceButtonText: replaceInLoc(config.entranceButtonText),
    gateQuestion: replaceInLoc(config.gateQuestion),
    gateSubtitle: replaceInLoc(config.gateSubtitle),
    gateHintButtonText: replaceInLoc(config.gateHintButtonText),
    gateErrorPrefix: replaceInLoc(config.gateErrorPrefix),
    celebrationTitle: replaceInLoc(config.celebrationTitle),
    celebrationSubtitle: replaceInLoc(config.celebrationSubtitle),
    cakeButtonText: replaceInLoc(config.cakeButtonText),
    cakeWishWhisper: replaceInLoc(config.cakeWishWhisper),
    cakeWishMessage: replaceInLoc(config.cakeWishMessage),
    readLetterButtonText: replaceInLoc(config.readLetterButtonText),
    letterTitle: replaceInLoc(config.letterTitle),
    letterSubtitle: replaceInLoc(config.letterSubtitle),
    letterContent: replaceInLoc(config.letterContent),
    letterExploreButtonText: replaceInLoc(config.letterExploreButtonText),
    journeyConfig: {
      ...config.journeyConfig,
      sectionTag: replaceInLoc(config.journeyConfig.sectionTag),
      sectionTitle: replaceInLoc(config.journeyConfig.sectionTitle),
      counterSuffix: replaceInLoc(config.journeyConfig.counterSuffix),
      counterSubtext: replaceInLoc(config.journeyConfig.counterSubtext),
    },
    milestones: config.milestones.map((m) => ({
      ...m,
      title: replaceInLoc(m.title),
      tagline: replaceInLoc(m.tagline),
      description: replaceInLoc(m.description),
    })),
    starsTitle: replaceInLoc(config.starsTitle),
    starsQuote: replaceInLoc(config.starsQuote),
    starsSubtitle: replaceInLoc(config.starsSubtitle),
    moonTapPrompt: replaceInLoc(config.moonTapPrompt),
    moonWhispers: config.moonWhispers.map((w) => ({
      ...w,
      text: replaceInLoc(w.text),
    })),
    starsNextButtonText: replaceInLoc(config.starsNextButtonText),
    finalChapterTag: replaceInLoc(config.finalChapterTag),
    finalSurprisePrompt: replaceInLoc(config.finalSurprisePrompt),
    openGiftButtonText: replaceInLoc(config.openGiftButtonText),
    finalMessage: replaceInLoc(config.finalMessage),
    signature: replaceInLoc(config.signature),
    replayButtonText: replaceInLoc(config.replayButtonText),
    loveScrollEnabled: config.loveScrollEnabled ?? true,
    loveScrollWishes: (config.loveScrollWishes || initialBirthdayConfig.loveScrollWishes || []).map((w) => ({
      ...w,
      text: replaceInLoc(w.text),
    })),
  };
}
