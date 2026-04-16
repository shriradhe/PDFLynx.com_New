import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional PDF tasks',
    icon: null,
    color: 'slate',
    features: [
      '10 files per day',
      'Max 10MB per file',
      '20+ PDF tools',
      'Merge, split, compress',
      'Convert, rotate, watermark',
      'Auto-delete after 30 min',
    ],
    notIncluded: ['AI Summary', 'Chat with PDF', 'Smart Search', 'Priority processing'],
    cta: 'Get Started Free',
    ctaLink: '/register',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'For professionals who need AI power',
    icon: SparklesIcon,
    color: 'brand',
    features: [
      '100 files per day',
      'Max 25MB per file',
      'All PDF tools',
      '✨ AI Summary',
      '✨ Chat with PDF',
      '✨ Smart Search (20/day)',
      'File history & analytics',
      'Priority processing',
    ],
    notIncluded: [],
    cta: 'Start 7-Day Free Trial',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: 'Business',
    price: '$29',
    period: '/month',
    description: 'For teams and high-volume workflows',
    icon: RocketLaunchIcon,
    color: 'purple',
    features: [
      '500 files per day',
      'Max 100MB per file',
      'All PDF tools',
      '✨ AI features (100/day)',
      'Team collaboration',
      'API access',
      'Webhook notifications',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Dedicated infrastructure & SLA',
    icon: BuildingOffice2Icon,
    color: 'amber',
    features: [
      'Unlimited files',
      'Max 500MB per file',
      'All features included',
      '✨ Unlimited AI access',
      'Custom integrations',
      'SSO / SAML',
      'Dedicated support',
      'On-premise deployment',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    ctaLink: '/register',
    popular: false,
  },
]

const colorMap = {
  slate: {
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    ring: 'border-slate-200 dark:border-white/10',
    btn: 'btn-secondary',
  },
  brand: {
    badge: 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400',
    ring: 'border-brand-500 dark:border-brand-500 ring-2 ring-brand-500/20',
    btn: 'btn-primary',
  },
  purple: {
    badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
    ring: 'border-purple-200 dark:border-purple-500/30',
    btn: 'btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/25',
  },
  amber: {
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    ring: 'border-amber-200 dark:border-amber-500/30',
    btn: 'btn-secondary',
  },
}

export default function Pricing() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-3 block">Simple, transparent pricing</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your <span className="text-gradient">Plan</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our full suite of 20+ PDF tools.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan, i) => {
            const colors = colorMap[plan.color];
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 flex flex-col relative ${colors.ring} ${plan.popular ? 'scale-[1.02]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-bold bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-medium mb-4 ${colors.badge}`}>
                  {plan.name}
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{plan.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                      <span className="w-4 h-4 text-center text-slate-400 flex-shrink-0">—</span>
                      <span className="text-slate-500 line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.ctaLink} className={`${colors.btn} w-full text-center py-3 text-sm`}>
                  {plan.cta}
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I use PDFLynx for free?', a: 'Absolutely! The free plan includes all 20+ PDF tools with a limit of 10 files per day. No credit card required.' },
              { q: 'What AI features are included?', a: 'AI features include PDF Summarization (multiple styles), Chat with PDF (ask questions), and Smart Search (find content by meaning). Available on Starter plans and above.' },
              { q: 'Are my files secure?', a: 'Yes. All files are processed on our secure servers and permanently deleted after 30 minutes. We never read, store, or share your documents.' },
              { q: 'Can I cancel anytime?', a: 'Yes, all paid plans can be cancelled at any time with no penalties. You\'ll retain access until the end of your billing period.' },
            ].map((faq) => (
              <div key={faq.q} className="card p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
