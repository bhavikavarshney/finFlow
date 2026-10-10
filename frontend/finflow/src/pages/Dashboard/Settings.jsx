import { useRef, useState } from 'react'
import { FiCheck, FiImage, FiSave, FiTrash2, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth'

const currencyOptions = [
  { code: 'INR', name: 'Indian Rupee (INR)' },
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
]

function resizeImage(file) {
  return createImageBitmap(file).then((image) => {
    const scale = Math.min(1, 320 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    image.close()
    return canvas.toDataURL('image/webp', 0.78)
  })
}

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const fileInput = useRef(null)
  const [name, setName] = useState(user?.name || '')
  const [currency, setCurrency] = useState(user?.currency || 'INR')
  const [avatarDataUrl, setAvatarDataUrl] = useState(user?.avatarDataUrl || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleImageChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError('Choose a JPEG, PNG, or WebP image under 5 MB.')
      return
    }
    try {
      const resized = await resizeImage(file)
      if (resized.length > 350000)
        throw new Error('Image is too large after resizing. Choose a smaller image.')
      setAvatarDataUrl(resized)
      setError('')
      setMessage('')
    } catch (imageError) {
      setError(imageError.message || 'Could not read that image. Try another file.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateProfile({ name, currency, avatarDataUrl })
      setMessage('Your profile settings were saved.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not save your profile. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section settings-page">
      <header className="page-title-row">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> PERSONAL PREFERENCES
          </span>
          <h1>Profile settings</h1>
          <p>Update how your account appears in finflow.</p>
        </div>
      </header>
      <form className="settings-panel" onSubmit={handleSubmit}>
        <section className="settings-avatar-section">
          <div className="settings-section-icon">
            <FiUser />
          </div>
          <div className="settings-section-copy">
            <h2>Profile picture</h2>
            <p>Choose a small image to personalize your profile.</p>
          </div>
          <div className="avatar-editor">
            <span className="settings-avatar">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Profile preview" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </span>
            <div className="avatar-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInput.current?.click()}
              >
                <FiImage /> Choose image
              </button>
              {avatarDataUrl && (
                <button type="button" className="text-button" onClick={() => setAvatarDataUrl('')}>
                  <FiTrash2 /> Remove
                </button>
              )}
              <input
                ref={fileInput}
                className="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </section>
        <section className="settings-fields">
          <div className="settings-section-icon">
            <FiUser />
          </div>
          <div className="settings-section-copy">
            <h2>Personal details</h2>
            <p>Your name and preferred display currency.</p>
          </div>
          <label className="settings-field">
            <span>Display name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label className="settings-field">
            <span>Display currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
            <small>
              Changes how amounts are formatted across the app. It does not convert stored values.
            </small>
          </label>
        </section>
        {error && (
          <p className="settings-message settings-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="settings-message settings-success" role="status">
            <FiCheck /> {message}
          </p>
        )}
        <footer className="settings-footer">
          <span>Signed in as {user?.email}</span>
          <button type="submit" className="add-button" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </footer>
      </form>
    </section>
  )
}
