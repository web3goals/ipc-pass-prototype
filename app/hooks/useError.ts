import { useToast } from "@/components/ui/use-toast";
import { errorToPrettyError } from "@/lib/errors";

/**
 * Hook to handle errors.
 */
export default function useError() {
  const { toast } = useToast();

  let handleError = function (error: Error, isErrorToastRequired: boolean) {
    console.error(error);
    if (isErrorToastRequired) {
      const prettyError = errorToPrettyError(error);
      toast({
        variant: "destructive",
        title: "Something went wrong :(",
        description: prettyError.message,
      });
    }
  };

  return {
    handleError,
  };
}
