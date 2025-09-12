-- Update the user to admin role and increase security clearance
UPDATE public.profiles 
SET 
  role = 'admin',
  security_clearance_level = 5,
  department = 'IT Security'
WHERE email = 'simonnyangala089@gmail.com';