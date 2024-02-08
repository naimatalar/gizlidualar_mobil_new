import LangApp from "../components/Language"

export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email) return LangApp("Emailcantbeempty")
  if (!re.test(email)) return 'Ooops! We need a valid email address.'
  return ''
}
