(() => {
  const grid = document.querySelector('#gallery-grid')
  const status = document.querySelector('#gallery-status')
  const filters = [...document.querySelectorAll('.gallery-filter')]
  if (!grid || !status) return

  const config = window.KSL_CONFIG || {}
  let items = []
  let activeCategory = ''

  const illustrativeItem = {
    id: 'illustration-climatiseur-avant-apres',
    title: 'Nettoyage de climatiseur mural — Avant / Après',
    description: 'Découvrez les étapes d’un nettoyage de climatiseur mural à l’eau, illustrées par une comparaison avant/après.',
    category: 'resultat',
    image_url: '/assets/img/a_clean_high_resolution_before_and_after_promotio.png',
    alt_text: 'Illustration avant et après le nettoyage d’un climatiseur mural, avec lavage d’un filtre à l’eau.'
  }


  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[c])

  const resolveImage = url => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    return url.startsWith('/') ? url : '/' + url
  }

  function render() {
    const allItems = [...items.filter(item => item.id !== illustrativeItem.id), illustrativeItem]
    const data = activeCategory
      ? allItems.filter(item => item.category === activeCategory)
      : allItems

    if (!data.length) {
      grid.innerHTML = '<div class="gallery-empty">Aucune image publiée dans cette catégorie pour le moment.</div>'
      return
    }

    grid.innerHTML = data.map(item => `
      <article class="gallery-card">
        <button class="gallery-image-button" type="button" data-image="${esc(resolveImage(item.image_url))}" data-alt="${esc(item.alt_text || item.title)}">
          <img src="${esc(resolveImage(item.image_url))}" alt="${esc(item.alt_text || item.title)}" loading="lazy">
        </button>
        <div class="gallery-card-body">
          <span class="gallery-chip">${esc(item.category || 'autre')}</span>
          <h3>${esc(item.title)}</h3>
          ${item.description ? `<p>${esc(item.description)}</p>` : ''}
        </div>
      </article>
    `).join('')

    document.querySelectorAll('.gallery-image-button').forEach(button => {
      button.onclick = () => openLightbox(button.dataset.image, button.dataset.alt)
    })
  }

  function openLightbox(src, alt) {
    const box = document.createElement('div')
    box.className = 'gallery-lightbox'
    box.innerHTML = `
      <button class="gallery-lightbox-close" aria-label="Fermer">×</button>
      <img src="${esc(src)}" alt="${esc(alt || '')}">
    `
    document.body.appendChild(box)
    box.querySelector('.gallery-lightbox-close').onclick = () => box.remove()
    box.onclick = event => { if (event.target === box) box.remove() }
    document.addEventListener('keydown', function onKey(event) {
      if (event.key === 'Escape') {
        box.remove()
        document.removeEventListener('keydown', onKey)
      }
    })
  }

  filters.forEach(button => {
    button.onclick = () => {
      activeCategory = button.dataset.category || ''
      filters.forEach(x => x.classList.toggle('active', x === button))
      render()
    }
  })

  async function load() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      status.textContent = 'Illustration disponible. Les autres réalisations sont temporairement indisponibles.'
      render()
      return
    }

    try {
      const url = new URL(config.supabaseUrl + '/rest/v1/gallery_media')
      url.searchParams.set('select', 'id,title,description,category,image_url,alt_text,sort_order,created_at')
      url.searchParams.set('is_published', 'eq.true')
      url.searchParams.set('order', 'sort_order.asc,created_at.desc')

      const response = await fetch(url, {
        headers: {
          apikey: config.supabaseKey,
          Authorization: 'Bearer ' + config.supabaseKey
        }
      })

      if (!response.ok) throw new Error('HTTP ' + response.status)
      items = await response.json()
      status.textContent = items.length
        ? items.length + ' photo' + (items.length > 1 ? 's' : '') + ' publiée' + (items.length > 1 ? 's' : '')
        : 'Aucune photo publiée pour le moment.'
      render()
    } catch (error) {
      console.error(error)
      status.textContent = 'Illustration disponible. Impossible de charger les autres réalisations pour le moment.'
      render()
    }
  }

  load()
})()
