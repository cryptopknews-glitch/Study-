export interface TenseInfo {
  slug: string
  name: string
  usage: string
  urduExplanation: string
  structure: string
  example: string
  negative: string
  question: string
  commonMistakes: string[]
}

export const TENSES: TenseInfo[] = [
  {
    slug: 'present-simple',
    name: 'Present Simple',
    usage: 'Daily routines, habits, and facts.',
    urduExplanation:
      'Present Simple un kaamon ke liye use hota hai jo hum roz karte hain (habit), ya jo hamesha sach hoti hain (fact). Jaise: "Main roz school jata hoon" ya "Suraj purab se nikalta hai".',
    structure: 'Subject + V1 (+s/es for he/she/it) + Object',
    example: 'I play cricket every day.\nShe plays cricket every day.',
    negative: 'I do not (don\'t) play cricket.\nShe does not (doesn\'t) play cricket.',
    question: 'Do I play cricket?\nDoes she play cricket?',
    commonMistakes: [
      'He/She/It ke sath "s" bhoolna: "He play" ki jagah "He plays" hona chahiye.',
      '"does" ke sath phir se "s" laga dena: "Does she plays?" ghalat, sahi hai "Does she play?"',
    ],
  },
  {
    slug: 'present-continuous',
    name: 'Present Continuous',
    usage: 'An action happening right now, or a temporary situation.',
    urduExplanation:
      'Ye tense un kaamon ke liye use hota hai jo abhi ho rahe hain, is waqt. Jaise: "Main abhi likh raha hoon".',
    structure: 'Subject + am/is/are + V1-ing + Object',
    example: 'I am playing cricket right now.\nShe is playing cricket right now.',
    negative: 'I am not playing cricket.\nShe is not (isn\'t) playing cricket.',
    question: 'Am I playing cricket?\nIs she playing cricket?',
    commonMistakes: [
      '"is/am/are" bhool jana: "She playing" ghalat, sahi hai "She is playing".',
      'Stative verbs (know, like, want) ke sath -ing lagana ghalat hai: "I am knowing" ghalat, "I know" sahi.',
    ],
  },
  {
    slug: 'present-perfect',
    name: 'Present Perfect',
    usage: 'An action completed at an unspecified time, with a result relevant to now.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo pehle ho chuke hain lekin unka asar abhi tak hai, ya waqt clear nahi hai. Jaise: "Maine khana kha liya hai".',
    structure: 'Subject + have/has + V3 (past participle) + Object',
    example: 'I have finished my homework.\nShe has finished her homework.',
    negative: 'I have not (haven\'t) finished my homework.\nShe has not (hasn\'t) finished it.',
    question: 'Have I finished my homework?\nHas she finished her homework?',
    commonMistakes: [
      'V2 form use karna V3 ki jagah: "I have went" ghalat, "I have gone" sahi.',
      'Specific past time ke sath use karna: "I have seen him yesterday" ghalat — "yesterday" ke sath Past Simple aata hai.',
    ],
  },
  {
    slug: 'present-perfect-continuous',
    name: 'Present Perfect Continuous',
    usage: 'An action that started in the past and is still continuing.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo pehle shuru hue the aur abhi tak jaari hain. Jaise: "Main do ghante se padh raha hoon".',
    structure: 'Subject + have/has + been + V1-ing + Object',
    example: 'I have been studying for two hours.\nShe has been studying for two hours.',
    negative: 'I have not been studying.\nShe has not been studying.',
    question: 'Have I been studying?\nHas she been studying?',
    commonMistakes: [
      '"been" bhool jana: "I have studying" ghalat, "I have been studying" sahi.',
      'Duration (for/since) ke bina is tense ko use na karein — hamesha time zaroor dein.',
    ],
  },
  {
    slug: 'past-simple',
    name: 'Past Simple',
    usage: 'A completed action at a specific time in the past.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo maazi mein ek specific waqt par mukammal ho chuke. Jaise: "Maine kal khat likha".',
    structure: 'Subject + V2 (past form) + Object',
    example: 'I played cricket yesterday.\nShe played cricket yesterday.',
    negative: 'I did not (didn\'t) play cricket.\nShe did not (didn\'t) play cricket.',
    question: 'Did I play cricket?\nDid she play cricket?',
    commonMistakes: [
      '"did" ke sath V2 use karna: "Did she played?" ghalat, "Did she play?" sahi.',
      'Irregular verbs ki V2 form yaad na hona: "goed" ghalat, "went" sahi.',
    ],
  },
  {
    slug: 'past-continuous',
    name: 'Past Continuous',
    usage: 'An action in progress at a moment in the past, often interrupted.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo maazi mein kisi waqt jaari the. Jaise: "Jab main ghar aaya, wo so raha tha".',
    structure: 'Subject + was/were + V1-ing + Object',
    example: 'I was playing cricket at 5 PM.\nThey were playing cricket at 5 PM.',
    negative: 'I was not (wasn\'t) playing cricket.\nThey were not (weren\'t) playing cricket.',
    question: 'Was I playing cricket?\nWere they playing cricket?',
    commonMistakes: ['"was" aur "were" ko mix karna: "I were" ghalat, "I was" sahi; "They was" ghalat, "They were" sahi.'],
  },
  {
    slug: 'past-perfect',
    name: 'Past Perfect',
    usage: 'An action completed before another action or point in the past.',
    urduExplanation:
      'Ye tense do maazi ke kaamon ko compare karta hai — jo pehle hua wo Past Perfect, jo baad mein hua wo Past Simple. Jaise: "Train chalne se pehle hum station pahunch chuke the".',
    structure: 'Subject + had + V3 + Object',
    example: 'I had finished my work before he arrived.',
    negative: 'I had not (hadn\'t) finished my work before he arrived.',
    question: 'Had I finished my work before he arrived?',
    commonMistakes: ['Dono kaamon ke liye Past Simple use kar dena, jisse tarteeb (sequence) clear nahi hoti.'],
  },
  {
    slug: 'past-perfect-continuous',
    name: 'Past Perfect Continuous',
    usage: 'An action that was ongoing up until a point in the past.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo maazi mein kisi waqt tak jaari rahe. Jaise: "Wo do ghante se intezar kar raha tha jab bus aayi".',
    structure: 'Subject + had been + V1-ing + Object',
    example: 'I had been waiting for two hours when the bus arrived.',
    negative: 'I had not been waiting when the bus arrived.',
    question: 'Had I been waiting when the bus arrived?',
    commonMistakes: ['"been" chhod dena: "I had waiting" ghalat, "I had been waiting" sahi.'],
  },
  {
    slug: 'future-simple',
    name: 'Future Simple',
    usage: 'A prediction, spontaneous decision, or a promise about the future.',
    urduExplanation: 'Ye tense mustaqbil (future) ke kaamon ke liye hai. Jaise: "Main kal aaunga".',
    structure: 'Subject + will + V1 + Object',
    example: 'I will play cricket tomorrow.',
    negative: 'I will not (won\'t) play cricket tomorrow.',
    question: 'Will I play cricket tomorrow?',
    commonMistakes: ['"will" ke baad V1 ki jagah dusri form: "will played" ghalat, "will play" sahi.'],
  },
  {
    slug: 'future-continuous',
    name: 'Future Continuous',
    usage: 'An action that will be in progress at a specific time in the future.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo mustaqbil mein kisi waqt jaari honge. Jaise: "Kal is waqt main safar kar raha hoonga".',
    structure: 'Subject + will be + V1-ing + Object',
    example: 'I will be traveling at this time tomorrow.',
    negative: 'I will not be traveling at this time tomorrow.',
    question: 'Will I be traveling at this time tomorrow?',
    commonMistakes: ['"be" chhod dena: "will traveling" ghalat, "will be traveling" sahi.'],
  },
  {
    slug: 'future-perfect',
    name: 'Future Perfect',
    usage: 'An action that will be completed before a specific point in the future.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo mustaqbil mein kisi waqt se pehle mukammal ho chuke honge. Jaise: "Main 5 baje tak kaam khatam kar chuka hoonga".',
    structure: 'Subject + will have + V3 + Object',
    example: 'I will have finished my work by 5 PM.',
    negative: 'I will not have finished my work by 5 PM.',
    question: 'Will I have finished my work by 5 PM?',
    commonMistakes: ['"have" bhool jana: "will finished" ghalat, "will have finished" sahi.'],
  },
  {
    slug: 'future-perfect-continuous',
    name: 'Future Perfect Continuous',
    usage: 'An action that will have been ongoing for a duration up to a point in the future.',
    urduExplanation:
      'Ye tense un kaamon ke liye hai jo mustaqbil ke kisi waqt tak jaari rahenge. Jaise: "Agle mahine tak main yahan do saal se kaam kar raha hoonga".',
    structure: 'Subject + will have been + V1-ing + Object',
    example: 'By next month, I will have been working here for two years.',
    negative: 'By next month, I will not have been working here for two years.',
    question: 'Will I have been working here for two years by next month?',
    commonMistakes: ['Structure ka koi hissa chhod dena — poora "will have been + V-ing" yaad rakhna zaroori hai.'],
  },
]

export function getTenseBySlug(slug: string): TenseInfo | undefined {
  return TENSES.find((t) => t.slug === slug)
}
