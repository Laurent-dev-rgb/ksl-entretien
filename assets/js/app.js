
const cfg = window.KSL_CONFIG || {}
const menu = document.querySelector('.nav')
const btn = document.querySelector('.menu-btn')
btn?.addEventListener('click', () => {
  const open = menu.classList.toggle('open')
  btn.setAttribute('aria-expanded', String(open))
})
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')))
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()

const email = document.getElementById('display-email')
if (email && cfg.email) { email.textContent = cfg.email; email.href = `mailto:${cfg.email}` }
const phone = document.getElementById('display-phone')
if (phone) { phone.textContent = cfg.phoneDisplay || 'À configurer'; phone.href = cfg.phoneE164 ? `tel:${cfg.phoneE164}` : '#' }
const wa = document.getElementById('whatsapp')
if (wa) {
  if (cfg.whatsappE164) wa.href = `https://wa.me/${cfg.whatsappE164.replace(/\D/g, '')}`
  else wa.style.display = 'none'
}

const form = document.getElementById('quote-form')
if (form) {
  const statusBox = document.getElementById('form-status')
  const submitButton = form.querySelector('button[type="submit"]')

  const showStatus = (message, success = false) => {
    if (!statusBox) return
    statusBox.hidden = false
    statusBox.textContent = message
    statusBox.className = success ? 'form-status success' : 'form-status error'
  }

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(form).entries())

    submitButton.disabled = true
    submitButton.textContent = 'Envoi en cours…'
    if (statusBox) statusBox.hidden = true

    const payload = {
      full_name: String(values.name || '').trim(),
      company: String(values.company || '').trim() || null,
      email: String(values.email || '').trim(),
      phone: String(values.phone || '').trim() || null,
      service: String(values.service || '').trim(),
      message: String(values.message || '').trim(),
      priority: 'normale',
      consent_privacy: values.consent_privacy === 'on',
      source: 'site_entretien',
      status: 'nouveau'
    }

    try {
      if (!cfg.supabaseUrl || !cfg.supabaseKey) throw new Error('Configuration Supabase absente')
      const response = await fetch(`${cfg.supabaseUrl}/rest/v1/quotes`, {
        method: 'POST',
        headers: {
          apikey: cfg.supabaseKey,
          Authorization: `Bearer ${cfg.supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const details = await response.text()
        throw new Error(details || `Erreur HTTP ${response.status}`)
      }

      form.reset()
      showStatus('Votre demande a été envoyée avec succès. KSL communiquera avec vous prochainement.', true)
    } catch (error) {
      console.error('Erreur de transmission :', error)
      showStatus('La demande n’a pas pu être envoyée. Réessayez ou contactez directement KSL.')
    } finally {
      submitButton.disabled = false
      submitButton.textContent = 'Envoyer la demande'
    }
  })
}
