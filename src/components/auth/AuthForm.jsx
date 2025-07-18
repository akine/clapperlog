import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import { Button } from '@/components/ui/button.jsx'

export default function AuthForm({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      onAuth(data.session)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border rounded px-3 py-2 w-full"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" type="submit">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          type="button"
          onClick={() => setIsSignUp((prev) => !prev)}
        >
          {isSignUp ? 'Have an account? Log In' : 'No account? Sign Up'}
        </Button>
      </form>
    </div>
  )
}
