import React from 'react'
import { Button } from '@/components/ui/button'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const customButtonVariants = cva(
  "group transition-all duration-200 font-semibold inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-6 text-lg group",
        secondary: "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 font-semibold px-8 py-6 text-lg group",
        outline: "border-1 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 font-semibold px-8 py-6 text-lg group",
        ghost: "text-slate-300 hover:text-white hover:bg-slate-800/30 bg-transparent border-0 px-8 py-6",
        danger: "bg-gradient-to-r px-8 py-6 from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 border-0",
        default: "",
        destructive: "",
        link: ""
      },
    },
    defaultVariants: {
      variant: "primary",
    }
  }
)

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof customButtonVariants> {
  children: React.ReactNode
  onClick?: () => void
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
  shadcnVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({
    children,
    onClick,
    variant = "primary",
    size = "default",
    shadcnVariant,
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    className,
    disabled,
    ...props
  }, ref) => {

    const iconSizes = {
      default: 'w-4 h-4',
      sm: 'w-3 h-3',
      lg: 'w-5 h-5',
      icon: 'w-4 h-4'
    }

    const iconSpacing = {
      left: iconPosition === 'left' ? 'mr-2' : '',
      right: iconPosition === 'right' ? 'ml-2' : ''
    }

    const iconClasses = cn(
      iconSizes[size || 'default'],
      iconSpacing[iconPosition],
      'group-hover:scale-110 transition-transform'
    )

    const handleClick = () => {
      if (!disabled && !loading && onClick) {
        onClick()
      }
    }

    const finalVariant = shadcnVariant || undefined

    return (
      <Button
        ref={ref}
        variant={finalVariant}
        size={size}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          customButtonVariants({ variant }),
          shadcnVariant && "bg-gradient-to-r-none transform-none hover:scale-100",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 mr-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={iconClasses} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={iconClasses} />
            )}
          </>
        )}
      </Button>
    )
  }
)

CustomButton.displayName = "CustomButton"

export default CustomButton