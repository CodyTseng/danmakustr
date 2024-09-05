import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export default function GenerateRandomAccount({
  handleGenerateRandomAccount,
}: {
  handleGenerateRandomAccount: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex w-full">
        <Button className="w-full" variant="destructive">
          {chrome.i18n.getMessage('generate_random_account')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {chrome.i18n.getMessage('generate_random_account_dialog_title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {chrome.i18n.getMessage('generate_random_account_dialog_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{chrome.i18n.getMessage('cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleGenerateRandomAccount}>
            {chrome.i18n.getMessage('continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
