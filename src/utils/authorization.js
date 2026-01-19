import dayjs from 'dayjs'

/**
 * 检查授权是否过期
 * @param {string} authEndTime - 授权结束时间 YYYY-MM-DD
 * @param {boolean} returnDays - 是否返回剩余天数
 * @returns {boolean|number|null} - 如果returnDays为false，返回是否过期；如果为true，返回剩余天数（null表示未设置）
 */
export function checkAuthorizationExpiry(authEndTime, returnDays = false) {
  if (!authEndTime) {
    return returnDays ? null : false
  }

  const endDate = dayjs(authEndTime)
  const today = dayjs()
  const daysRemaining = endDate.diff(today, 'day')

  if (returnDays) {
    return daysRemaining
  }

  return daysRemaining <= 0
}

/**
 * 获取授权状态
 * @param {string} authEndTime - 授权结束时间
 * @returns {string} - 'active' | 'expiring' | 'expired'
 */
export function getAuthorizationStatus(authEndTime) {
  const daysRemaining = checkAuthorizationExpiry(authEndTime, true)
  
  if (daysRemaining === null) {
    return 'active'
  }
  
  if (daysRemaining <= 0) {
    return 'expired'
  }
  
  if (daysRemaining <= 30) {
    return 'expiring'
  }
  
  return 'active'
}

