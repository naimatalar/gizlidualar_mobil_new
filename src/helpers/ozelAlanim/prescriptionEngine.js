const GOAL_LIBRARY = {
  huzur: {
    label: 'Huzur',
    tasks: [
      {
        code: 'huzur_sabah_zikir',
        title: 'Sabah Huzur Zikri',
        description: 'Fetih Suresi 1-5 ayetlerini 3 kez oku ve derin nefes eşliğinde tefekkür et.',
        recommendedTime: 'morning',
        durationMinutes: 5,
      },
      {
        code: 'huzur_aksam_tefekkur',
        title: 'Akşam Şükür Tefekkürü',
        description: 'Gün içinde seni mutlu eden 3 olayı not al ve şükret.',
        recommendedTime: 'evening',
        durationMinutes: 7,
      },
    ],
  },
  bereket: {
    label: 'Bereket',
    tasks: [
      {
        code: 'bereket_sabah_dua',
        title: 'Rızık Duası',
        description: 'Sabah namazından sonra “Ya Rezzak” esmasını 33 kez zikret.',
        recommendedTime: 'morning',
        durationMinutes: 4,
      },
      {
        code: 'bereket_ogle_sadaka',
        title: 'Gönüllü Paylaşım',
        description: 'Bugün birine küçük bir iyilik yap veya sadaka ver.',
        recommendedTime: 'midday',
        durationMinutes: 6,
      },
    ],
  },
  sifa: {
    label: 'Şifa',
    tasks: [
      {
        code: 'sifa_sabah_dua',
        title: 'Şifa Ayetleri',
        description: 'Fatiha, Ayet-el Kürsi ve Şifa Ayetlerini suya okuyup iç.',
        recommendedTime: 'morning',
        durationMinutes: 10,
      },
      {
        code: 'sifa_gece_sessizlik',
        title: 'Gece Sessizliği',
        description: 'Uyumadan önce 10 derin nefes alarak bedenini rahatlat.',
        recommendedTime: 'evening',
        durationMinutes: 8,
      },
    ],
  },
  iliski: {
    label: 'İlişkiler',
    tasks: [
      {
        code: 'iliski_sabah_dua',
        title: 'Sevgi Duası',
        description: '“Ya Vedud” esmasını 19 kez zikret; ardından sevdiklerine dua et.',
        recommendedTime: 'morning',
        durationMinutes: 5,
      },
      {
        code: 'iliski_aksam_iletisim',
        title: 'Gönülden Mesaj',
        description: 'Bugün sevdiğin birine minnettarlığını ifade eden bir mesaj gönder.',
        recommendedTime: 'evening',
        durationMinutes: 6,
      },
    ],
  },
}

const TIME_SLOTS = {
  morning: { hour: 7, minute: 0 },
  midday: { hour: 13, minute: 0 },
  evening: { hour: 20, minute: 30 },
  custom: { hour: 9, minute: 0 },
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function differenceInDays(later, earlier) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((later - earlier) / msPerDay)
}

function addMinutes(baseDate, minutes) {
  const result = new Date(baseDate)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

function buildSlotDate(referenceDate, slotInfo) {
  const scheduled = new Date(referenceDate)
  scheduled.setHours(slotInfo.hour)
  scheduled.setMinutes(slotInfo.minute)
  scheduled.setSeconds(0)
  scheduled.setMilliseconds(0)
  return scheduled
}

function expandTasks(goals = [], intensity = 'balanced') {
  const pool = goals.flatMap((goalKey) => GOAL_LIBRARY[goalKey]?.tasks || [])

  if (pool.length === 0) {
    return []
  }

  const intensityMap = {
    light: 2,
    balanced: 3,
    deep: 4,
  }

  const limit = intensityMap[intensity] || 3
  const selected = []
  const codes = new Set()

  pool.forEach((task) => {
    if (!codes.has(task.code) && selected.length < limit) {
      selected.push({ ...task })
      codes.add(task.code)
    }
  })

  if (selected.length < limit) {
    Object.keys(GOAL_LIBRARY).forEach((key) => {
      GOAL_LIBRARY[key].tasks.forEach((task) => {
        if (!codes.has(task.code) && selected.length < limit) {
          selected.push({ ...task })
          codes.add(task.code)
        }
      })
    })
  }

  return selected
}

export function generateDailyPlan(profile, referenceDate = new Date()) {
  if (!profile) {
    return {
      date: formatDate(referenceDate),
      tasks: [],
      meta: {
        intensity: 'balanced',
        goals: [],
      },
    }
  }

  const { goals = [], intensity = 'balanced', focusMode = 'spiritual', customNotes } = profile

  const tasks = expandTasks(goals, intensity).map((task, index) => {
    const slotInfo = TIME_SLOTS[task.recommendedTime] || TIME_SLOTS.custom
    const baseSlot = buildSlotDate(referenceDate, slotInfo)
    const scheduled = addMinutes(baseSlot, index)

    return {
      id: `${formatDate(referenceDate).replace(/-/g, '')}_${task.code}`,
      ...task,
      scheduledAt: scheduled.toISOString(),
      status: 'pending',
      focusMode,
      customNotes,
    }
  })

  return {
    date: formatDate(referenceDate),
    tasks,
    meta: {
      intensity,
      goals,
      focusMode,
      customNotes,
    },
  }
}

export function calculatePerformance(history = []) {
  if (!history.length) {
    return {
      completionRate: 0,
      streak: 0,
      habits: [],
      totals: {
        tasks: 0,
        completed: 0,
        pending: 0,
      },
      recentDays: [],
    }
  }

  const completedDays = history.filter((day) =>
    day.tasks?.some((task) => (task.status || '').toLowerCase() === 'completed')
  ).length
  const completionRate = Math.round((completedDays / history.length) * 100)

  let currentStreak = 0
  let previousDate = null

  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))
  sortedHistory.forEach((day) => {
    const hasCompletion = day.tasks?.some((task) => task.status === 'done')
    if (!hasCompletion) {
      return
    }
    const currentDate = new Date(day.date)
    if (!previousDate) {
      currentStreak = 1
      previousDate = currentDate
      return
    }
    const difference = differenceInDays(previousDate, currentDate)
    if (difference === 1) {
      currentStreak += 1
      previousDate = currentDate
    }
  })

  const habitMap = {}
  history.forEach((day) => {
    day.tasks?.forEach((task) => {
      if ((task.status || '').toLowerCase() === 'completed') {
        habitMap[task.code] = (habitMap[task.code] || 0) + 1
      }
    })
  })

  let totalTasks = 0
  let completedTasks = 0
  history.forEach((day) => {
    day.tasks?.forEach((task) => {
      totalTasks += 1
      if ((task.status || '').toLowerCase() === 'completed') {
        completedTasks += 1
      }
    })
  })
  const pendingTasks = Math.max(totalTasks - completedTasks, 0)

  const recentDays = [...history]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-5)
    .map((day) => {
      const doneCount = day.tasks?.filter((task) => task.status === 'done').length || 0
      const total = day.tasks?.length || 0
      return {
        date: day.date,
        completed: doneCount,
        total,
      }
    })

  const habits = Object.entries(habitMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }))

  return {
    completionRate,
    streak: currentStreak,
    habits,
    totals: {
      tasks: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
    },
    recentDays,
  }
}

export const GOAL_OPTIONS = Object.entries(GOAL_LIBRARY).map(([value, data]) => ({
  value,
  label: data.label,
}))

export const DEFAULT_PROFILE = {
  goals: ['huzur'],
  intensity: 'balanced',
  focusMode: 'spiritual',
  notificationsEnabled: true,
  customNotes: undefined,
}
