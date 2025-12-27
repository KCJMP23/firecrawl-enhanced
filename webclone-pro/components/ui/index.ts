/**
 * UI Components Index
 * 
 * Central export file for all shared UI components
 */

// Simple Components
export { SimpleButton } from './simple-button'
export { SimpleCard, SimpleCardHeader, SimpleCardTitle, SimpleCardContent, SimpleCardFooter } from './simple-card'

// Existing shadcn/ui components
export { Button } from './button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Badge } from './badge'
export { Input, Textarea, Label, FormField } from './input'
export { ScrollArea } from './scroll-area'
export { Separator } from './separator'
export { Switch } from './switch'
export { Checkbox } from './checkbox'
export { Progress } from './progress'
export { Alert, AlertTitle, AlertDescription } from './alert'

// New components for production build
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from './select'
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'

// Re-export commonly used types
export type { ButtonProps } from './button'