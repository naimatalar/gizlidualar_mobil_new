import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import * as Notifications from 'expo-notifications'

import { LangApp } from '../components/Language'
import apiConstant from '../helpers/dataApi/apiConstant'
import { DEFAULT_PROFILE, GOAL_OPTIONS, calculatePerformance } from '../helpers/ozelAlanim/prescriptionEngine'
import {
  fetchDailyPlan,
  fetchHistory,
  fetchProfile,
  fetchPrescriptionTemplate,
  fetchPlanByDuaId,
  matchPrescriptionDua,
  createPrescriptionSchedule,
  submitDailyCompletion,
  updateProfile,
  deleteAllPlans,
} from '../helpers/dataApi/prescriptionService'
import AdmobViewBanner from '../components/ads/AdmobViewBanner'

async function cancelScheduledNotifications(ids = []) {
  if (!Array.isArray(ids) || !ids.length) {
    return
  }
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null)))
}

async function schedulePlanNotifications(plan, enableNotifications, existingIds, setIds) {
  if (!plan?.tasks?.length || !enableNotifications) {
    await cancelScheduledNotifications(existingIds)
    if (setIds) {
      setIds([])
    }
    return
  }

  await cancelScheduledNotifications(existingIds)

  const now = Date.now()
  const ids = await Promise.all(
    plan.tasks.map(async (task, index) => {
      const triggerDate = new Date(task.scheduledAt)
      if (triggerDate.getTime() <= now) {
        triggerDate.setMinutes(triggerDate.getMinutes() + index + 1)
      }

      try {
        const localTime = triggerDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        console.log(`[Notifications] ${task.title || task.id} görevi için ${localTime} saatinde bildirim planlandı.`)
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: task.title,
            body: task.description,
            data: { taskId: task.id },
            sound: null,
          },
          trigger: triggerDate,
        })
        return id
      } catch (error) {
        console.warn('Notification schedule error', error)
        return null
      }
    })
  )

  const filteredIds = ids.filter(Boolean)
  if (setIds) {
    setIds(filteredIds)
  }
}

const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null
  }
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  const normalized = value.replace(/^\/+/, '')
  return `${apiConstant.IMAGEBASEURL}/${normalized}`
}

const formatPlanDate = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

const formatPlanTime = (value) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const TabButton = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    delayPressOut={()=>{return true}  }  
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    activeOpacity={0.8}
  >
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={isActive ? '#FFFFFF' : '#1A237E'}
      style={styles.tabButtonIcon}
    />
    <Text
      style={[styles.tabButtonLabel, isActive && styles.tabButtonLabelActive]}
      numberOfLines={2}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

const PlanAccordionList = ({ days = [], expandedDays = [], onToggleDay, onToggleTask, todayDate }) => {
  const [todayPulse] = useState(new Animated.Value(1))
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(todayPulse, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(todayPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start()
  }, [todayPulse])
  if (!days.length) {
      return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="calendar-question" size={32} color="#90A4AE" />
        <Text style={styles.emptyText}>{LangApp('hicKayitYok')}</Text>
      </View>
    )
  }

  const now = Date.now()
  const threeHoursMs = 3 * 60 * 60 * 1000

  const normalizeStatus = (task) => (task?.status || 'pending').toLowerCase()

  const renderTaskAction = (task, isToday, planDate) => {
    const scheduled = new Date(task.scheduledAt)
    const scheduledMs = scheduled.getTime()
    const normalizedStatus = normalizeStatus(task)
    const isDone = normalizedStatus === 'completed'
    const flaggedMissed = normalizedStatus === 'missed'
    const isFuture = scheduledMs > now
    const isMissed = flaggedMissed || (!isDone && !isFuture && now - scheduledMs >= threeHoursMs)
    const canComplete = isToday && !isDone && !isMissed && !isFuture

    if (isDone) {
      return (
        <TouchableOpacity
          style={[styles.statusBadgeCircle, styles.statusBadgeDone]}
          onPress={() => onToggleTask?.({ ...task, planDate })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )
    }

    if (isMissed) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeMissed]}>
          <Text style={[styles.statusBadgeLabel, styles.statusBadgeLabelMissed]}>
            {LangApp('kacirildi') || 'Kaçırıldı'}
          </Text>
  </View>
)
    }

    if (canComplete) {
      return (
        <TouchableOpacity style={styles.taskToggle} onPress={() => onToggleTask?.({ ...task, planDate })}>
          <Text style={styles.taskToggleLabel}>{LangApp('gorevTamamla')}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <View style={styles.statusTimeBadge}>
        <MaterialCommunityIcons name="clock-outline" size={14} color="#607D8B" />
        <Text style={styles.statusTimeText}>
          {scheduled.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    )
  }

  const baseDateMs = days?.length && days[0]?.date ? new Date(`${days[0].date}T00:00:00`).getTime() : null
  const dayMs = 24 * 60 * 60 * 1000

  return (
    <View>
      {days.map((day, index) => {
        const dayKey = day.date || `${index}`
        const isExpanded = expandedDays.includes(dayKey)
        const totalTasks = day.tasks?.length || 0
        const completedTasks = day.tasks?.filter((task) => normalizeStatus(task) === 'completed').length || 0
        const isToday = day.date === todayDate

        const currentDateMs = day?.date ? new Date(`${day.date}T00:00:00`).getTime() : NaN
        const dayNumber =
          baseDateMs != null && Number.isFinite(currentDateMs)
            ? Math.round((currentDateMs - baseDateMs) / dayMs) + 1
            : index + 1

        return (
          <View key={dayKey} style={styles.accordionCard}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => onToggleDay(dayKey)}>
              <View>
                <View style={styles.accordionTitleRow}>
                  <Text style={styles.accordionTitle}>
                    {dayNumber}. Gün · {formatPlanDate(day.date)}
                  </Text>
                  {isToday && (
                    <Animated.View style={[styles.todayIcon, { opacity: todayPulse }]}>
                      <MaterialCommunityIcons name="calendar-blank" size={20} color="#FF7043" />
                    </Animated.View>
                  )}
                </View>
                <View style={styles.dayStatusRow}>
                  {(day.tasks || []).map((task, dotIndex) => {
                    const scheduled = new Date(task.scheduledAt)
                    const scheduledMs = scheduled.getTime()
                const normalizedStatus = normalizeStatus(task)
                const isDone = normalizedStatus === 'completed'
                const isFuture = normalizedStatus === 'scheduled' || scheduledMs > now
                const isMissed = normalizedStatus === 'missed' || (!isDone && !isFuture && now - scheduledMs >= threeHoursMs)
                    let dotStyle = styles.dayStatusDotPending
                    if (isDone) {
                      dotStyle = styles.dayStatusDotDone
                    } else if (isMissed) {
                      dotStyle = styles.dayStatusDotMissed
                    } else if (isFuture) {
                      dotStyle = styles.dayStatusDotFuture
                    }
        return (
                      <View key={task.id || dotIndex} style={[styles.dayStatusDot, dotStyle]}>
                        <Text style={styles.dayStatusDotText}>{dotIndex + 1}</Text>
                      </View>
                    )
                  })}
            </View>
              </View>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4A148C"
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.accordionContent}>
                {day.tasks?.length ? (
                  day.tasks.map((task, taskIndex) => {
                    const scheduled = new Date(task.scheduledAt)
                    const scheduledMs = scheduled.getTime()
                    const normalizedStatus = normalizeStatus(task)
                    const isDone = normalizedStatus === 'completed'
                    const flaggedMissed = normalizedStatus === 'missed'
                    const isFuture = scheduledMs > now
                    const isMissed = flaggedMissed || (!isDone && !isFuture && now - scheduledMs >= threeHoursMs)

                    let taskStyle = styles.accordionTaskRow
                    if (isDone) {
                      taskStyle = [styles.accordionTaskRow, styles.accordionTaskRowDone]
                    } else if (isMissed) {
                      taskStyle = [styles.accordionTaskRow, styles.accordionTaskRowMissed]
                    } else if (isFuture) {
                      taskStyle = [styles.accordionTaskRow, styles.accordionTaskRowFuture]
                    }

                    let statusDotStyle = styles.statusDotPending
                    if (isDone) {
                      statusDotStyle = styles.statusDotDone
                    } else if (isMissed) {
                      statusDotStyle = styles.statusDotMissed
                    } else if (isFuture) {
                      statusDotStyle = styles.statusDotFuture
                    }

                    return (
                      <View key={task.id} style={taskStyle}>
                        <View style={styles.accordionTaskInfo}>
                          {resolveImageUrl(task.imageUrl) ? (
                            <TouchableOpacity onPress={() => onToggleTask?.({ ...task, planDate: day.date, previewOnly: true })}>
                              <Image source={{ uri: resolveImageUrl(task.imageUrl) }} style={styles.taskInlineImage} />
                            </TouchableOpacity>
                          ) : null}
                          <Text style={styles.accordionTaskTitle}>{task.title}</Text>
                          {task.description ? (
                            <Text style={styles.accordionTaskDescription}>{task.description}</Text>
                          ) : null}
                          <Text style={styles.accordionTaskTime}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#607D8B" />{' '}
                            {new Date(task.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        {renderTaskAction(task, isToday, day.date)}
                      </View>
                    )
                  })
                ) : (
                  <Text style={styles.historyTask}>{LangApp('hicKayitYok')}</Text>
                )}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

const HistoryList = ({ history }) => {
  if (!history.length) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="history" size={32} color="#90A4AE" />
        <Text style={styles.emptyText}>{LangApp('hicKayitYok')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      {history.map((day) => {
        const completed = day.tasks?.filter((task) => (task.status || '').toLowerCase() === 'completed') || []
        return (
          <View key={day.date} style={styles.historyDay}>
            <Text style={styles.historyDate}>{day.date}</Text>
            <Text style={styles.historySummary}>
              {LangApp('tamamlananGorev')}: {completed.length}/{day.tasks?.length || 0}
            </Text>
            {completed.map((task) => (
              <Text key={task.id} style={styles.historyTask}>
                • {task.title}
              </Text>
            ))}
          </View>
        )
      })}
    </View>
  )
}

const AnalysisView = ({ performance }) => {
  const totals = performance?.totals || { tasks: 0, completed: 0, pending: 0 }
  const recentDays = performance?.recentDays || []
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{LangApp('analizOzeti')}</Text>
      <View style={styles.analysisSummaryRow}>
        <View style={styles.analysisSummaryCard}>
          <Text style={styles.analysisSummaryLabel}>{LangApp('tamamlamaOrani')}</Text>
          <Text style={styles.analysisSummaryValue}>{performance.completionRate}%</Text>
        </View>
        <View style={styles.analysisSummaryCard}>
          <Text style={styles.analysisSummaryLabel}>{LangApp('seri')}</Text>
          <Text style={styles.analysisSummaryValue}>{performance.streak}</Text>
        </View>
        <View style={styles.analysisSummaryCard}>
          <Text style={styles.analysisSummaryLabel}>{LangApp('tamamlanan')}</Text>
          <Text style={styles.analysisSummaryValue}>
            {totals.completed}/{totals.tasks}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, styles.analysisSectionSpacing]}>{LangApp('analizTrend')}</Text>
      {recentDays.length ? (
        <View style={styles.analysisTrendList}>
          {recentDays.map((day) => {
            const percent = day.total ? Math.round((day.completed / day.total) * 100) : 0
            return (
              <View key={day.date} style={styles.analysisTrendRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.analysisTrendDate}>{formatPlanDate(day.date)}</Text>
                  <Text style={styles.analysisTrendMeta}>
                    {day.completed}/{day.total} {LangApp('tamamlanan')}
                  </Text>
                </View>
                <View style={styles.analysisTrendBar}>
                  <View style={[styles.analysisTrendFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.analysisTrendPercent}>{percent}%</Text>
              </View>
            )
          })}
        </View>
      ) : (
        <Text style={styles.historyTask}>{LangApp('hicKayitYok')}</Text>
      )}

      <Text style={[styles.sectionTitle, styles.analysisSectionSpacing]}>{LangApp('enSikYapilanlar')}</Text>
      {performance.habits?.length ? (
        performance.habits.map((habit) => (
          <Text key={habit.code} style={styles.historyTask}>
            • {habit.code} ({habit.count})
          </Text>
        ))
      ) : (
        <Text style={styles.historyTask}>{LangApp('hicKayitYok')}</Text>
      )}
    </View>
  )
}

const analysisTagSamples = ['huzur', 'uyku','para','bereket', 'mutluluk', 'şifa', 'bolluk', 'umut','bereket', 'denge', 'sabır']

const AnalysisModal = ({ visible, desireText }) => {
  const [pairs, setPairs] = useState([])
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      opacity.stopAnimation()
      opacity.setValue(0)
    }
    return () => opacity.stopAnimation()
  }, [visible, opacity])

  useEffect(() => {
    if (!visible) {
      setPairs([])
      return
    }
    const userWords = desireText
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean)
    let wordIndex = 0
    let tagIndex = 0
    setPairs([])
    const interval = setInterval(() => {
      const userWord = userWords[wordIndex] || desireText || LangApp('arzulariniYaz')
      const tagWord = analysisTagSamples[tagIndex % analysisTagSamples.length]
      setPairs((prev) => {
        const next = [...prev, { id: Date.now(), userWord, tagWord }]
        return next.slice(-8)
      })
      wordIndex = (wordIndex + 1) % Math.max(userWords.length, 1)
      tagIndex += 1
    }, 400)
    return () => clearInterval(interval)
  }, [visible, desireText])

  if (!visible) {
    return null
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.analysisBackdrop}>
        <View style={styles.analysisContent}>
          <Animated.View style={[styles.analysisPulse, { opacity }]} />
          <MaterialCommunityIcons name="robot-happy" size={36} color="#FFF" style={styles.analysisIcon} />
          <Text style={styles.analysisTitle}>{LangApp('analizEdiliyor')}</Text>
          <Text style={styles.analysisSubtitle}>{LangApp('aiMatchInfo')}</Text>
          <View style={styles.analysisStream}>
            {pairs.map((pair) => (
              <View key={pair.id} style={styles.analysisRow}>
                <Text style={styles.analysisUserText}>{pair.userWord}</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFAB40" />
                <Text style={styles.analysisTagText}>{pair.tagWord}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const ProfileModal = ({
  visible,
  onClose,
  onSave,
  onSelectCategory,
  onSelectDua,
  selectedCategory,
  selectedDua,
  planPreview = [],
  planDescription = '',
  previewLoading = false,
  modalLoading = false,
  canSave = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [desireText, setDesireText] = useState('')
  const [matchLoading, setMatchLoading] = useState(false)
  const [analysisVisible, setAnalysisVisible] = useState(false)

  const steps = [
    { key: 'desire', label: LangApp('arzulariniYaz') },
    { key: 'plan', label: LangApp('planOnizleme') },
  ]

  useEffect(() => {
    if (!visible) {
      setStepIndex(0)
      setDesireText('')
      setMatchLoading(false)
      return
    }

    if (!selectedDua) {
      setStepIndex(0)
    } else {
      setStepIndex(1)
    }
  }, [visible, selectedDua])

  const currentStepIndex = stepIndex
  const canSubmitDesire = desireText.trim().length >= 5 && !matchLoading

  const handlePreviousStep = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleDesireSubmit = useCallback(async () => {
    const desire = desireText.trim()
    if (!desire) {
      Alert.alert(LangApp('uyari'), LangApp('arzulariniYazUyari'))
      return
    }
    setMatchLoading(true)
    setAnalysisVisible(true)
    try {
      const matchPromise = matchPrescriptionDua(desire)
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 4000))
      const [matchResult] = await Promise.all([matchPromise, delayPromise])
      if (!matchResult?.dua?.id) {
        throw new Error('match_not_found')
      }
      if (matchResult.category) {
        await onSelectCategory?.(matchResult.category)
      }
      await onSelectDua?.(matchResult.dua)
      setStepIndex(1)
    } catch (error) {
      console.warn('matchPrescriptionDua error', error)
      Alert.alert(LangApp('hata'), LangApp('eslesmeBulunamadi'))
    } finally {
      setAnalysisVisible(false)
      setMatchLoading(false)
    }
  }, [desireText, onSelectCategory, onSelectDua])

  const content = (
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{LangApp('profiliniOlustur')}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#263238" />
            </TouchableOpacity>
          </View>

          <View style={styles.stepperWrapper}>
            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <React.Fragment key={step.key}>
                  <View style={styles.stepperItem}>
                    <View
                      style={[
                        styles.stepperCircle,
                        isActive && styles.stepperCircleActive,
                        isCurrent && styles.stepperCircleCurrent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperCircleLabel,
                          isActive && styles.stepperCircleLabelActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepperLabel, isActive && styles.stepperLabelActive]}>{step.label}</Text>
                  </View>
                  {index < steps.length - 1 ? (
                    <View
                      style={[
                        styles.stepperConnector,
                        index < currentStepIndex && styles.stepperConnectorActive,
                      ]}
                    />
                  ) : null}
                </React.Fragment>
              )
            })}
          </View>

          <ScrollView style={{ maxHeight: '70%' }}>
            {currentStepIndex === 0 ? (
              <View>
                <Text style={styles.modalLabel}>{LangApp('arzulariniYaz')}</Text>
                <Text style={styles.desireHelperText}>{LangApp('arzulariniYazAciklama')}</Text>
                <View style={styles.aiInfoBanner}>
                  <MaterialCommunityIcons name="robot-outline" size={18} color="#BF360C" style={{ marginRight: 6 }} />
                  <Text style={styles.aiInfoText}>{LangApp('aiMatchInfo')}</Text>
                </View>
                <TextInput
                  style={styles.desireInput}
                  multiline
                  placeholder={LangApp('arzulariniYazPlaceholder')}
                  placeholderTextColor="#90A4AE"
                  value={desireText}
                  onChangeText={setDesireText}
                />
              </View>
            ) : (
              <View>
                {selectedDua ? (
                  <View style={styles.matchSummaryCard}>
                    <Text style={styles.matchSummaryTitle}>{LangApp('onerilenPlan')}</Text>
                    <Text style={styles.matchSummaryText}>
                      {selectedCategory?.name || LangApp('kategoriSecildi')}
                    </Text>
                    <Text style={styles.matchSummaryDua}>{selectedDua?.title}</Text>
            </View>
                ) : (
                  <Text style={styles.historyTask}>{LangApp('eslesmeBekleniyor')}</Text>
                )}

                <Text style={[styles.modalLabel, { marginTop: 16 }]}>{LangApp('planAciklamasi')}</Text>
                <Text style={styles.planDescriptionText}>
                  {planDescription || LangApp('planDescriptionPlaceholder')}
                </Text>

            <Text style={[styles.modalLabel, { marginTop: 16 }]}>{LangApp('planOnizleme')}</Text>
            {previewLoading ? (
              <ActivityIndicator color="#4A148C" style={{ marginVertical: 12 }} />
            ) : planPreview?.length ? (
              (() => {
                let globalStep = 0
                return planPreview.map((plan) => {
                  const tasks = plan.tasks || []
                  return (
                    <View key={plan.date} style={styles.previewDay}>
                          <Text style={styles.previewDate}>{formatPlanDate(plan.date)}</Text>
                      {tasks.length ? (
                        tasks.map((task) => {
                          globalStep += 1
                          return (
                            <View key={task.id} style={styles.previewTaskStep}>
                              <View style={styles.previewStepBadge}>
                                <Text style={styles.previewStepLabel}>
                                  {LangApp('adim')} {globalStep}
                                </Text>
                              </View>
                              <View style={styles.previewTaskContent}>
                                    <Text style={styles.previewTaskTime}>{formatPlanTime(task.scheduledAt)}</Text>
                                <Text style={styles.previewTaskDescription}>{task.description || task.title}</Text>
                              </View>
                            </View>
                          )
                        })
                      ) : (
                        <Text style={styles.historyTask}>{LangApp('hicKayitYok')}</Text>
                      )}
                    </View>
                  )
                })
              })()
            ) : (
              <Text style={styles.historyTask}>{LangApp('planPreviewPlaceholder')}</Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.stepNavigation}>
            <TouchableOpacity
              style={[
                styles.stepNavButton,
                styles.stepNavButtonSpacer,
                stepIndex === 0 && styles.stepNavButtonDisabled,
              ]}
              onPress={handlePreviousStep}
              disabled={stepIndex === 0}
            >
              <Text
                style={[
                  styles.stepNavButtonText,
                  stepIndex === 0 && styles.stepNavButtonTextDisabled,
                ]}
              >
                {LangApp('geri')}
              </Text>
            </TouchableOpacity>
            {stepIndex === 0 ? (
              <TouchableOpacity
              delayPressOut={()=>{return true}  }  
                style={[
                  styles.stepNavButtonPrimary,
                  !canSubmitDesire && styles.stepNavButtonDisabled,
                ]}
                onPress={handleDesireSubmit}
                disabled={!canSubmitDesire}
              >
                {matchLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    style={[
                      styles.stepNavPrimaryText,
                      !canSubmitDesire && styles.stepNavButtonTextDisabled,
                    ]}
                  >
                    {LangApp('devamEt')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.modalButtonSecondary}>
              <Text style={styles.modalButtonSecondaryText}>{LangApp('iptal')}</Text>
            </TouchableOpacity>
            {currentStepIndex === 1 ? (
            <TouchableOpacity
              onPress={onSave}
              style={[styles.modalButtonPrimary, (!canSave || modalLoading) && styles.modalButtonPrimaryDisabled]}
              disabled={!canSave || modalLoading}
            >
              {modalLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalButtonPrimaryText}>{LangApp('planiOlustur')}</Text>
              )}
            </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
  )

  if (!visible) {
    return null
  }

  return (
    <>
      {content}
      <AnalysisModal visible={analysisVisible} desireText={desireText} />
    </>
  )
}

const OzelAlanim = () => {
  const [activeTab, setActiveTab] = useState('today')
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [draftProfile, setDraftProfile] = useState(DEFAULT_PROFILE)
  const [todayPlan, setTodayPlan] = useState(null)
  const [history, setHistory] = useState([])
  const [performance, setPerformance] = useState(calculatePerformance([]))
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [notificationIds, setNotificationIds] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDua, setSelectedDua] = useState(null)
  const [planPreview, setPlanPreview] = useState([])
  const [planDescription, setPlanDescription] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [expandedDays, setExpandedDays] = useState([])
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const [serverProfile, serverHistory] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchHistory().catch(() => []),
        ])

        if (isMounted) {
          const finalProfile = serverProfile || DEFAULT_PROFILE
          setProfile(finalProfile)
          setDraftProfile(finalProfile)
          setHistory(serverHistory || [])
          await ensurePlan()
        }
      } catch (error) {
        console.warn('OzelAlanim init error', error)
        await ensurePlan()
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [ensurePlan])

  useEffect(() => {
    if (!modalVisible) {
      resetModalState()
      return
    }
  }, [modalVisible, resetModalState])

  useEffect(
    () => () => {
      cancelScheduledNotifications(notificationIds).catch(() => null)
    },
    [notificationIds]
  )

  useEffect(() => {
    setPerformance(calculatePerformance(history))
  }, [history])

  useEffect(() => {
    if (!profile.notificationsEnabled) {
      cancelScheduledNotifications(notificationIds).catch((error) =>
        console.warn('cancelScheduledNotifications error', error)
      )
      setNotificationIds([])
      return
    }

    const upcomingTasks = todayHistory
      .flatMap((plan) => plan?.tasks || [])
      .filter((task) => {
        const date = new Date(task.scheduledAt)
        const status = (task.status || '').toLowerCase()
        return (
          status !== 'completed' &&
          !Number.isNaN(date.getTime()) &&
          date.getTime() >= Date.now()
        )
      })

    if (!upcomingTasks.length) {
      cancelScheduledNotifications(notificationIds).catch((error) =>
        console.warn('cancelScheduledNotifications error', error)
      )
      setNotificationIds([])
      return
    }

    schedulePlanNotifications({ tasks: upcomingTasks }, true, notificationIds, setNotificationIds).catch((error) =>
      console.warn('schedulePlanNotifications error', error)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayHistory, profile.notificationsEnabled])

  const ensurePlan = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const existing = await fetchDailyPlan(today)
      setTodayPlan(existing || null)
      return existing
    } catch (error) {
      console.warn('fetchDailyPlan error', error)
      setTodayPlan(null)
      return null
    }
  }, [])

  const resetModalState = useCallback(() => {
    setSelectedCategory(null)
    setSelectedDua(null)
    setPlanPreview([])
    setPlanDescription('')
  }, [])

  const handleModalOpen = useCallback(() => {
    // Mevcut plan kontrolü
    const hasExistingPlan = todayHistory.length > 0
    if (hasExistingPlan) {
      Alert.alert(
        'Mevcut Plan Var',
        'Zaten bir planınız bulunmaktadır. Yeni plan oluşturmak için mevcut planı kaldırmalısınız.',
        [
          {
            text: 'Tamam',
            style: 'default',
          },
        ]
      )
      return
    }
    setModalVisible(true)
  }, [todayHistory])

  const handleModalClose = useCallback(() => {
    setModalVisible(false)
    resetModalState()
    setDraftProfile(profile)
  }, [profile, resetModalState])

  const handleDeletePlan = useCallback(() => {
    setDeleteConfirmVisible(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteAllPlans()
      // Bildirimleri iptal et
      await cancelScheduledNotifications(notificationIds)
      setNotificationIds([])
      // Verileri yenile
      await reloadData()
      setDeleteConfirmVisible(false)
    } catch (error) {
      console.warn('deleteAllPlans error', error?.response?.data || error)
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'Plan silinirken bir hata oluştu.'
      Alert.alert('Hata', backendMessage)
    }
  }, [notificationIds, reloadData])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmVisible(false)
  }, [])

  const reloadData = useCallback(async () => {
    await ensurePlan()
    try {
      const latestHistory = await fetchHistory()
      setHistory(latestHistory || [])
    } catch (error) {
      console.warn('fetchHistory error', error)
    }
  }, [ensurePlan])

  const handleSelectCategory = useCallback(
    async (category) => {
      setSelectedCategory(category)
      setSelectedDua(null)
      setPlanPreview([])
      setPlanDescription('')

      if (!category?.id) {
        setDraftProfile((prev) => ({ ...prev, goals: [] }))
        return
      }

        setDraftProfile((prev) => ({
          ...prev,
          goals: category.name ? [category.name] : [],
        }))
    },
    []
  )

  const handleSelectDua = useCallback(
    async (dua) => {
      setSelectedDua(dua)
      setPlanPreview([])
      setPlanDescription('')

      if (!dua?.id) {
        return
      }

      try {
        setPreviewLoading(true)
        const template = await fetchPrescriptionTemplate(dua.id).catch(() => null)
        setPlanDescription(template?.description || '')
        const preview = await fetchPlanByDuaId(dua.id)
        setPlanPreview(preview || [])
        setDraftProfile((prev) => {
          const goals = []
          if (selectedCategory?.name) {
            goals.push(selectedCategory.name)
          }
          if (dua.title) {
            goals.push(dua.title)
          }
          return { ...prev, goals }
        })
      } catch (error) {
        console.warn('fetchPlanByDuaId error', error)
        setPlanPreview([])
      } finally {
        setPreviewLoading(false)
      }
    },
    [selectedCategory]
  )

  const handleCreatePlan = useCallback(async () => {
    if (!selectedDua?.id) {
      Alert.alert('Uyarı', 'Lütfen bir dua seç.')
      return
    }

    try {
      setModalLoading(true)
      const updatedProfile = await updateProfile(draftProfile)
      setProfile(updatedProfile)
      setDraftProfile(updatedProfile)
    } catch (error) {
      console.warn('updateProfile error', error)
    }

    try {
      const scheduleResponse = await createPrescriptionSchedule({ duaId: selectedDua.id })
      if (profile.notificationsEnabled && scheduleResponse?.plans?.length) {
        const upcomingTasks = scheduleResponse.plans
          .flatMap((plan) => plan?.tasks || [])
          .filter((task) => {
            const date = new Date(task.scheduledAt)
            const status = (task.status || '').toLowerCase()
            return (
              status !== 'completed' &&
              !Number.isNaN(date.getTime()) &&
              date.getTime() >= Date.now()
            )
          })
     
        if (upcomingTasks.length) {
          await schedulePlanNotifications(
            { tasks: upcomingTasks },
            true,
            notificationIds,
            setNotificationIds
          )
        console.log(
          `[Notifications] ${upcomingTasks.length} görev için bildirim planlaması tamamlandı.`
        )
        }
      }
      await reloadData()
      handleModalClose()
    } catch (error) {
      console.warn('createPrescriptionSchedule error', error)
      Alert.alert('Hata', 'Plan oluşturulamadı.')
    } finally {
      setModalLoading(false)
    }
  }, [
    draftProfile,
    handleModalClose,
    notificationIds,
    profile.notificationsEnabled,
    reloadData,
    selectedDua,
  ])

  const canSavePlan = !!selectedDua?.id && planPreview.length > 0 && !previewLoading && !modalLoading

  const handleToggleDayCollapse = useCallback((key) => {
    setExpandedDays((prev) => (prev.includes(key) ? [] : [key]))
  }, [])

  const [imagePreview, setImagePreview] = useState(null)

  const handleToggleTask = async (task) => {
debugger
    if (!task?.id) {
      return
    }
    const targetDate =
      task?.planDate || todayPlan?.date || new Date(task.scheduledAt).toISOString().split('T')[0]
 
    try {
      const normalizedStatus = (task.status || '').toLowerCase()
      const isDone = normalizedStatus === 'completed'
      const response = await submitDailyCompletion({
        taskId: task.id,
        status: isDone ? 'pending' : 'completed',
        date: targetDate,
      })
      console.log('[Tasks] submitDailyCompletion success', {
        taskId: task.id,
        status: isDone ? 'pending' : 'completed',
        date: targetDate,
        response,
      })
      await reloadData()
    } catch (error) {
      console.warn('submitDailyCompletion error', error)
      Alert.alert('Hata', 'Görev güncellenemedi, lütfen tekrar deneyin.')
    }
  }

  const todayHistory = useMemo(() => {
    const combined = todayPlan ? [todayPlan, ...history.filter((item) => item.date !== todayPlan.date)] : [...history]

    return combined
      .map((plan) => ({
        ...plan,
        __dateValue: plan?.date ? new Date(`${plan.date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => a.__dateValue - b.__dateValue)
      .map(({ __dateValue, ...rest }) => rest)
  }, [history, todayPlan])

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    if (!todayHistory.length) {
      setExpandedDays([])
      return
    }
    setExpandedDays((prev) => {
      if (prev.length) {
        return prev
      }
      // Bugünün tarihine ait günü bul ve aç
      const todayDay = todayHistory.find((day) => day.date === todayDate)
      if (todayDay && todayDay.date) {
        return [todayDay.date]
      }
      // Bugünün tarihi yoksa ilk günü aç
      const firstKey = todayHistory[0].date || '0'
      return [firstKey]
    })
  }, [todayHistory, todayDate])

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingState}>
          <MaterialCommunityIcons name="progress-clock" size={28} color="#4A148C" />
          <Text style={styles.loadingText}>{LangApp('yukleniyor')}</Text>
        </View>
      )
    }

    if (activeTab === 'today') {
      return (
        <PlanAccordionList
          days={todayHistory}
          expandedDays={expandedDays}
          onToggleDay={handleToggleDayCollapse}
          onToggleTask={handleToggleTask}
          todayDate={todayDate}
        />
      )
    }
    if (activeTab === 'history') {
      return <HistoryList history={todayHistory} />
    }
    return <AnalysisView performance={performance} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{LangApp('ozelAlanim')}</Text>
          <Text style={styles.headerSubtitle}>{LangApp('gorevTasarimi')}</Text>
        </View>
        <TouchableOpacity  delayPressOut={()=>{return true}  }   style={styles.profileButton} onPress={handleModalOpen}>
          <MaterialCommunityIcons name="account-cog" size={22} color="#4A148C" />
          <Text style={styles.profileButtonLabel}>{LangApp('profiliniOlustur')}</Text>
        </TouchableOpacity>
      </View>
      <AdmobViewBanner
                  iosAdUnitId="ca-app-pub-8795169628743262/9326945854"   // iOS için unit ID
                  androidAdUnitId="ca-app-pub-8795169628743262/4266190864" // Android için gerçek unit ID
                  bannerSize="SMART_BANNER" // İstersen 'BANNER', 'LARGE_BANNER' vs. de verebilirsin
                  style={{ alignItems: 'center', paddingVertical: 4 }}
                />

      <View style={styles.aiInfoBanner}>
        <MaterialCommunityIcons name="robot" size={16} color="#4A148C" />
        <Text style={styles.aiInfoText}>
          Niyetinizin veya arzunuzun hasıl olması için yapay zeka ile size özel günlük dua uygulanışları planı çıkarıyoruz.
        </Text>
      </View>
   
      <View style={styles.tabRow}>
        <TabButton
          label={LangApp('gorevler')}
          icon="calendar-today"
          isActive={activeTab === 'today'}
          onPress={() => setActiveTab('today')}
        />
        <TabButton
          label={LangApp('gecmis')}
          icon="history"
          isActive={activeTab === 'history'}
          onPress={() => setActiveTab('history')}
        />
        <TabButton
          label={LangApp('analiz')}
          icon="chart-areaspline"
          isActive={activeTab === 'analysis'}
          onPress={() => setActiveTab('analysis')}
        />
      </View>

      {todayHistory.length > 0 && !modalVisible && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePlan}>
            <MaterialCommunityIcons name="delete" size={20} color="#D32F2F" />
            <Text style={styles.deleteButtonLabel}>Bu Planı Kaldır</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>{renderContent()}</ScrollView>

      <ProfileModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSave={handleCreatePlan}
        onSelectCategory={handleSelectCategory}
        onSelectDua={handleSelectDua}
        selectedCategory={selectedCategory}
        selectedDua={selectedDua}
        planPreview={planPreview}
        planDescription={planDescription}
        previewLoading={previewLoading}
        modalLoading={modalLoading}
        canSave={canSavePlan}
      />
      <Modal visible={!!imagePreview} transparent animationType="fade">
        <View style={styles.imagePreviewBackdrop}>
          <TouchableOpacity style={styles.imagePreviewBackdrop} onPress={() => setImagePreview(null)}>
            {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.imagePreview} /> : null}
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={deleteConfirmVisible} transparent animationType="fade">
        <View style={styles.deleteModalBackdrop}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Planı Kaldır</Text>
            <Text style={styles.deleteModalMessage}>Plan kaldırılacak, onaylıyor musunuz?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity  delayPressOut={()=>{return true}  }   style={styles.deleteModalCancelButton} onPress={handleCancelDelete}>
                <Text style={styles.deleteModalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity  delayPressOut={()=>{return true}  }   style={styles.deleteModalConfirmButton} onPress={handleConfirmDelete}>
                <Text style={styles.deleteModalConfirmText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A237E',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#5C6BC0',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  profileButtonLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4A148C',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  deleteButtonLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
  },
  aiInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  aiInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#4A148C',
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deleteButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    minHeight: 58,
  },
  tabButtonActive: {
    backgroundColor: '#4A148C',
  },
  tabButtonIcon: {
    marginRight: 8,
  },
  tabButtonLabel: {
    flex: 1,
    marginLeft: 4,
    color: '#1A237E',
    fontWeight: '600',
    fontSize: 13,
    flexWrap: 'wrap',
    textAlign: 'left',
    lineHeight: 18,
  },
  tabButtonLabelActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283593',
  },
  taskDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#455A64',
  },
  taskMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#607D8B',
  },
  taskToggle: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#4A148C',
  },
  taskToggleDone: {
    backgroundColor: '#4A148C',
  },
  taskToggleLabel: {
    fontSize: 12,
    color: '#4A148C',
    fontWeight: '600',
  },
  taskToggleLabelDone: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#607D8B',
  },
  historyDay: {
    marginBottom: 16,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A237E',
  },
  historySummary: {
    fontSize: 13,
    color: '#37474F',
    marginTop: 4,
  },
  historyTask: {
    fontSize: 13,
    color: '#546E7A',
    marginLeft: 8,
    marginTop: 4,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceMetric: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D47A1',
  },
  performanceLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#1E88E5',
  },
  analysisSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  analysisSummaryCard: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  analysisSummaryLabel: {
    fontSize: 12,
    color: '#6A1B9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#311B92',
    marginTop: 4,
  },
  analysisSectionSpacing: {
    marginTop: 20,
  },
  analysisTrendList: {
    marginTop: 8,
  },
  analysisTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisTrendDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A237E',
  },
  analysisTrendMeta: {
    fontSize: 12,
    color: '#607D8B',
  },
  analysisTrendBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 999,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  analysisTrendFill: {
    height: 8,
    backgroundColor: '#7E57C2',
    borderRadius: 999,
  },
  analysisTrendPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5E35B1',
    minWidth: 36,
    textAlign: 'right',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4A148C',
  },
  modalBackdrop: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283593',
    marginBottom: 8,
  },
  desireHelperText: {
    fontSize: 13,
    color: '#607D8B',
    marginBottom: 8,
  },
  desireInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#263238',
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  aiInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: 10,
  },
  aiInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#BF360C',
    fontWeight: '600',
  },
  analysisBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analysisContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A237E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  analysisPulse: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  analysisIcon: {
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 18,
  },
  analysisStream: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  analysisUserText: {
    flex: 1,
    fontSize: 13,
    color: '#FFECB3',
    marginRight: 8,
  },
  analysisTagText: {
    flex: 0.8,
    fontSize: 13,
    color: '#FFAB40',
    textAlign: 'right',
    fontWeight: '600',
  },
  stepNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepNavButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  stepNavButtonSpacer: {
    marginRight: 8,
  },
  stepNavButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#4A148C',
  },
  stepNavButtonDisabled: {
    opacity: 0.5,
  },
  stepNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
  },
  stepNavPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepNavButtonTextDisabled: {
    color: '#CFD8DC',
  },
  todaySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todaySummaryMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#546E7A',
  },
  detailButton: {
    backgroundColor: '#4A148C',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  selectionSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
  },
  matchSummaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  matchSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6A1B9A',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  matchSummaryText: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 4,
  },
  matchSummaryDua: {
    fontSize: 18,
    fontWeight: '700',
    color: '#311B92',
  },
  selectionSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A148C',
    marginBottom: 6,
  },
  selectionSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionSummaryValue: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#311B92',
  },
  detailBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  detailDate: {
    fontSize: 13,
    color: '#5C6BC0',
    marginBottom: 12,
  },
  detailScroll: {
    maxHeight: '65%',
  },
  detailTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  detailTaskRowDone: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  detailTaskInfo: {
    flex: 1,
    marginRight: 12,
  },
  detailTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#283593',
  },
  detailTaskDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#455A64',
  },
  detailTaskTime: {
    marginTop: 6,
    fontSize: 12,
    color: '#607D8B',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ECEFF1',
  },
  statusBadgeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  statusBadgeDone: {
    backgroundColor: '#2E7D32',
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#37474F',
  },
  statusBadgeLabelDone: {
    color: '#1B5E20',
  },
  detailCloseButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A148C',
  },
  detailCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A148C',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#37474F',
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#ECEFF1',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#4A148C',
  },
  segmentLabel: {
    color: '#37474F',
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#37474F',
  },
  planDescriptionText: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    color: '#455A64',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  modalButtonSecondaryText: {
    color: '#546E7A',
    fontSize: 14,
  },
  modalButtonPrimary: {
    backgroundColor: '#4A148C',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtonPrimaryDisabled: {
    opacity: 0.6,
  },
  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepperItem: {
    alignItems: 'center',
    minWidth: 72,
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CFD8DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    borderColor: '#4A148C',
    backgroundColor: '#4A148C',
  },
  stepperCircleCurrent: {
    borderColor: '#4A148C',
  },
  stepperCircleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A148C',
  },
  stepperCircleLabelActive: {
    color: '#FFFFFF',
  },
  stepperLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#90A4AE',
    textAlign: 'center',
  },
  stepperLabelActive: {
    color: '#4A148C',
  },
  stepperConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#CFD8DC',
    marginHorizontal: 6,
  },
  stepperConnectorActive: {
    backgroundColor: '#4A148C',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A148C',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  tagItemActive: {
    backgroundColor: '#4A148C',
  },
  tagItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#F3E5F5',
  },
  tagAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE7F6',
  },
  tagAvatarPlaceholderActive: {
    backgroundColor: '#7B1FA2',
  },
  tagLabel: {
    color: '#4A148C',
    fontSize: 13,
    fontWeight: '600',
  },
  tagLabelActive: {
    color: '#FFFFFF',
  },
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
  },
  todayIcon: {
    marginLeft: 8,
  },
  accordionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#FF7043',
  },
  accordionSubtitleDone: {
    color: '#1B5E20',
  },
  dayStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dayStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  dayStatusDotDone: {
    backgroundColor: '#4CAF50',
  },
  dayStatusDotPending: {
    backgroundColor: '#FF7043',
  },
  dayStatusDotMissed: {
    backgroundColor: '#E53935',
  },
  dayStatusDotFuture: {
    backgroundColor: '#90A4AE',
  },
  dayStatusDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dayStatusText: {
    fontSize: 13,
    color: '#37474F',
    fontWeight: '600',
  },
  accordionContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingTop: 12,
  },
  accordionTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 12,
    padding: 12,
  },
  accordionTaskRowDone: {
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9',
  },
  accordionTaskRowMissed: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF3F3',
  },
  accordionTaskRowFuture: {
    borderColor: '#CFD8DC',
    backgroundColor: '#ECEFF1',
  },
  accordionTaskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskInlineImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePreviewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imagePreview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  deleteModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#546E7A',
  },
  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accordionTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#283593',
  },
  accordionTaskDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#455A64',
  },
  accordionTaskTime: {
    marginTop: 6,
    fontSize: 12,
    color: '#607D8B',
  },
  statusDotDone: {
    backgroundColor: '#4CAF50',
  },
  statusDotMissed: {
    backgroundColor: '#E53935',
  },
  statusDotFuture: {
    backgroundColor: '#90A4AE',
  },
  statusDotPending: {
    backgroundColor: '#FF9800',
  },
  statusBadgeMissed: {
    backgroundColor: '#FFCDD2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  statusBadgeLabelMissed: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  statusTimeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#37474F',
  },
  previewDay: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
  },
  previewDate: {
    fontWeight: '700',
    color: '#311B92',
    marginBottom: 6,
  },
  previewTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewTaskStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewStepBadge: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  previewStepLabel: {
    color: '#4A148C',
    fontWeight: '600',
    fontSize: 12,
  },
  previewTaskContent: {
    flex: 1,
  },
  previewTaskTime: {
    color: '#4A148C',
    fontWeight: '600',
    fontSize: 13,
  },
  previewTaskDescription: {
    color: '#37474F',
    fontSize: 13,
  },
})

export default OzelAlanim
