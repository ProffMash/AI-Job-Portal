from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, role='seeker', **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, role='employer', **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('seeker', 'Seeker'),
        ('employer', 'Employer'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='seeker')
    
    # Common fields
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)
    
    # Seeker-specific fields
    skills = models.JSONField(default=list, blank=True)  # Store as JSON array
    experience = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    linkedin = models.URLField(max_length=500, blank=True, null=True)
    github = models.URLField(max_length=500, blank=True, null=True)
    portfolio = models.URLField(max_length=500, blank=True, null=True)
    
    # Employer-specific fields
    company = models.CharField(max_length=255, blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    founded = models.CharField(max_length=10, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Override the default related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='job_users',
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='job_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.JSONField(default=list)  # Store as JSON array
    salary = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full-time')
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    posted_at = models.DateTimeField(auto_now_add=True)
    applicant_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.title} at {self.company}"


class SavedCandidate(models.Model):
    """Model to store employer's saved/shortlisted candidates"""
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_candidates')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_by_employers')
    match_score = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    applied_for = models.CharField(max_length=255, blank=True, null=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-saved_at']
        unique_together = ['employer', 'candidate']  # Prevent duplicate saves

    def __str__(self):
        return f"{self.employer.email} saved {self.candidate.email}"


class Application(models.Model):
    """Model to store job applications from seekers"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ['job', 'seeker']  # Prevent duplicate applications

    def __str__(self):
        return f"{self.seeker.email} applied to {self.job.title}"
