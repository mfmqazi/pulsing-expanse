export const memorizationPlan = [
    { day: 1, surah: 1, startVerse: 1, endVerse: 7, label: "Surah Al-Fatiha" },
    { day: 2, surah: 2, startVerse: 1, endVerse: 5, label: "Surah Al-Baqarah (1-5)" },
    { day: 3, surah: 2, startVerse: 6, endVerse: 10, label: "Surah Al-Baqarah (6-10)" },
    { day: 4, surah: 2, startVerse: 11, endVerse: 16, label: "Surah Al-Baqarah (11-16)" },
    { day: 5, surah: 2, startVerse: 17, endVerse: 20, label: "Surah Al-Baqarah (17-20)" },
    { day: 6, surah: 2, startVerse: 1, endVerse: 20, label: "Review: Days 1-5", isReview: true },
];

export const getPlanForDay = (day) => memorizationPlan.find(p => p.day === day);

export const getCurrentPlan = (surah, verseIndex) => {
    // verseIndex is 0-based, so verse number is verseIndex + 1
    const verseNum = verseIndex + 1;
    return memorizationPlan.find(p =>
        p.surah === surah &&
        verseNum >= p.startVerse &&
        verseNum <= p.endVerse &&
        !p.isReview // Prefer the actual memorization day over review day for current progress
    );
};
