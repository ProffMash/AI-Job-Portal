from django.shortcuts import render
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action

from .models import User, Job
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ProfileSerializer, JobSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create token for the new user
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'User registered successfully',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'name': user.name,
                    'role': user.role,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                # Ensure user has a token and return it
                token, _ = Token.objects.get_or_create(user=user)
                
                # Build full avatar URL
                avatar_url = None
                if user.avatar:
                    avatar_url = request.build_absolute_uri(user.avatar.url)
                
                return Response({
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'name': user.name,
                    'role': user.role,
                    'avatar': avatar_url,
                    'bio': user.bio,
                    'location': user.location,
                    'phone': user.phone,
                    'website': user.website,
                    'skills': user.skills,
                    'experience': user.experience,
                    'education': user.education,
                    'linkedin': user.linkedin,
                    'github': user.github,
                    'portfolio': user.portfolio,
                    'company': user.company,
                    'company_size': user.company_size,
                    'industry': user.industry,
                    'founded': user.founded,
                    'is_active': user.is_active,
                    'created_at': user.created_at,
                    'message': 'Login successful',
                    'token': token.key,
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['list', 'destroy']:
            # Only admin can list all users or delete
            return [IsAdminUser()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAuthenticated()]
        elif self.action == 'me':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        # Non-admin users can only see active users
        return User.objects.filter(is_active=True)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update the current authenticated user's profile"""
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        partial = request.method == 'PATCH'
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def seekers(self, request):
        """Get all job seekers"""
        seekers = User.objects.filter(role='seeker', is_active=True)
        serializer = self.get_serializer(seekers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def employers(self, request):
        """Get all employers"""
        employers = User.objects.filter(role='employer', is_active=True)
        serializer = self.get_serializer(employers, many=True)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ViewSet):
    """ViewSet for managing user profiles"""
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['seekers', 'employers']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer(self, *args, **kwargs):
        return ProfileSerializer(*args, **kwargs)

    def list(self, request):
        """Get the current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """Get or update the current user's profile"""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        partial = request.method == 'PATCH'
        serializer = self.get_serializer(request.user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'], url_path='skills')
    def update_skills(self, request):
        """Update user skills (seekers only)"""
        user = request.user
        if user.role != 'seeker':
            return Response(
                {'error': 'Only job seekers can update skills'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        skills = request.data.get('skills', [])
        if not isinstance(skills, list):
            return Response(
                {'error': 'Skills must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.skills = skills
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='company')
    def update_company(self, request):
        """Update company info (employers only)"""
        user = request.user
        if user.role != 'employer':
            return Response(
                {'error': 'Only employers can update company info'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        allowed_fields = ['company', 'company_size', 'industry', 'founded', 'website']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='avatar')
    def upload_avatar(self, request):
        """Upload user avatar"""
        user = request.user
        
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avatar = request.FILES['avatar']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Allowed: JPEG, PNG, GIF, WEBP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if avatar.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.avatar = avatar
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def seekers(self, request):
        """Get all job seekers"""
        seekers = User.objects.filter(role='seeker', is_active=True)
        serializer = UserSerializer(seekers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def employers(self, request):
        """Get all employers"""
        employers = User.objects.filter(role='employer', is_active=True)
        serializer = UserSerializer(employers, many=True)
        return Response(serializer.data)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'by_employer']:
            return [AllowAny()]
        elif self.action in ['create']:
            # Only employers can create jobs
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the job owner can update/delete
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Job.objects.all()
        
        # Filter by job type
        job_type = self.request.query_params.get('type', None)
        if job_type:
            queryset = queryset.filter(type=job_type)
        
        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by company
        company = self.request.query_params.get('company', None)
        if company:
            queryset = queryset.filter(company__icontains=company)
        
        # Search in title and description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        # Ensure only employers can create jobs
        if self.request.user.role != 'employer':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only employers can post jobs')
        serializer.save(posted_by=self.request.user)

    def perform_update(self, serializer):
        # Ensure only the job owner can update
        if serializer.instance.posted_by != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only update your own jobs')
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure only the job owner can delete
        if instance.posted_by != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only delete your own jobs')
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        """Get jobs posted by the current employer"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        jobs = Job.objects.filter(posted_by=request.user)
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_employer(self, request):
        """Get jobs by a specific employer"""
        employer_id = request.query_params.get('employer_id', None)
        if not employer_id:
            return Response({'error': 'employer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        jobs = Job.objects.filter(posted_by_id=employer_id)
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent jobs (last 10)"""
        jobs = Job.objects.all()[:10]
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)


from .models import SavedCandidate
from .serializers import SavedCandidateSerializer


class SavedCandidateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing saved/shortlisted candidates"""
    serializer_class = SavedCandidateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return saved candidates for the authenticated employer
        return SavedCandidate.objects.filter(employer=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['delete'], url_path='by-candidate/(?P<candidate_id>[^/.]+)')
    def remove_by_candidate(self, request, candidate_id=None):
        """Remove a candidate from saved list by candidate ID"""
        try:
            saved = SavedCandidate.objects.get(employer=request.user, candidate_id=candidate_id)
            saved.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SavedCandidate.DoesNotExist:
            return Response({'error': 'Saved candidate not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='check/(?P<candidate_id>[^/.]+)')
    def check_saved(self, request, candidate_id=None):
        """Check if a candidate is saved"""
        is_saved = SavedCandidate.objects.filter(employer=request.user, candidate_id=candidate_id).exists()
        return Response({'is_saved': is_saved})

    @action(detail=False, methods=['patch'], url_path='notes/(?P<candidate_id>[^/.]+)')
    def update_notes(self, request, candidate_id=None):
        """Update notes for a saved candidate"""
        try:
            saved = SavedCandidate.objects.get(employer=request.user, candidate_id=candidate_id)
            saved.notes = request.data.get('notes', '')
            saved.save()
            serializer = self.get_serializer(saved)
            return Response(serializer.data)
        except SavedCandidate.DoesNotExist:
            return Response({'error': 'Saved candidate not found'}, status=status.HTTP_404_NOT_FOUND)


from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job applications"""
    serializer_class = ApplicationSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seeker':
            # Seekers can only see their own applications
            return Application.objects.filter(seeker=user)
        elif user.role == 'employer':
            # Employers can see applications for their jobs
            return Application.objects.filter(job__posted_by=user)
        return Application.objects.none()

    def get_serializer_class(self):
        if self.action == 'update_status':
            return ApplicationStatusSerializer
        return ApplicationSerializer

    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        """Get all applications for the current seeker"""
        if request.user.role != 'seeker':
            return Response({'error': 'Only seekers can view their applications'}, status=status.HTTP_403_FORBIDDEN)
        applications = Application.objects.filter(seeker=request.user)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='for-job/(?P<job_id>[^/.]+)')
    def for_job(self, request, job_id=None):
        """Get all applications for a specific job (employer only)"""
        try:
            job = Job.objects.get(id=job_id)
            if job.posted_by != request.user:
                return Response({'error': 'You can only view applications for your own jobs'}, status=status.HTTP_403_FORBIDDEN)
            applications = Application.objects.filter(job=job)
            serializer = self.get_serializer(applications, many=True)
            return Response(serializer.data)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """Update application status (employer only)"""
        try:
            application = self.get_object()
            if application.job.posted_by != request.user:
                return Response({'error': 'You can only update applications for your own jobs'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ApplicationStatusSerializer(application, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(ApplicationSerializer(application).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='check/(?P<job_id>[^/.]+)')
    def check_applied(self, request, job_id=None):
        """Check if current user has applied to a job"""
        has_applied = Application.objects.filter(job_id=job_id, seeker=request.user).exists()
        return Response({'has_applied': has_applied})

    def destroy(self, request, pk=None):
        """Delete an application (seeker can withdraw, employer can delete)"""
        try:
            application = self.get_object()
            user = request.user
            
            # Seeker can delete their own applications
            if user.role == 'seeker' and application.seeker == user:
                application.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            # Employer can delete applications for their jobs
            if user.role == 'employer' and application.job.posted_by == user:
                application.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            return Response({'error': 'You do not have permission to delete this application'}, status=status.HTTP_403_FORBIDDEN)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
