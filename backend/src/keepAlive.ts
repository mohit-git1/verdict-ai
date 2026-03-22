export const startKeepAlive = () => {
  const url = process.env.RENDER_URL || ''
  if (!url) return
  
  setInterval(async () => {
    try {
      await fetch(`${url}/health`)
      console.log('🏓 Keep-alive ping sent')
    } catch (err) {
      console.log('Keep-alive failed:', err)
    }
  }, 14 * 60 * 1000) // every 14 minutes
}