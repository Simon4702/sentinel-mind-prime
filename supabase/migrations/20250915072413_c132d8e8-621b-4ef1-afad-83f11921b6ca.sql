-- Add DELETE policy for admins to manage profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (get_user_role() = 'admin'::user_role);