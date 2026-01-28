from rest_framework import serializers
from django.conf import settings
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')
    name = serializers.CharField(required=False, allow_blank=True, default='')
    role = serializers.CharField(required=False, default='seeker')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['email', 'username', 'name', 'password', 'role', 'phone', 'location']

    def create(self, validated_data):
        # Ensure a username is provided; derive from email if absent
        raw_email = validated_data['email']
        provided_username = validated_data.get('username', '') or ''
        base_username = provided_username.strip() if provided_username.strip() else raw_email.split('@')[0]
        username = base_username
        # Ensure uniqueness by appending a numeric suffix if needed
        counter = 0
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base_username}{counter}"

        # Get role from validated data, default to 'seeker'
        role = validated_data.get('role', 'seeker')
        if role not in ['seeker', 'employer']:
            role = 'seeker'

        user = User.objects.create_user(
            email=raw_email,
            username=username,
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            role=role,
            phone=validated_data.get('phone', ''),
            location=validated_data.get('location', ''),
        )
        return user

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('Password is required')
        if len(value) < 6:
            raise serializers.ValidationError('Password must be at least 6 characters long')
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True,
        default=list
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'name', 'role',
            'avatar', 'bio', 'location', 'phone', 'website',
            'skills', 'experience', 'education', 'linkedin', 'github', 'portfolio',
            'company', 'company_size', 'industry', 'founded',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'created_at']

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return f"{settings.SITE_URL.rstrip('/')}{obj.avatar.url}"
        return None

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with additional validation"""
    avatar = serializers.SerializerMethodField()
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'name', 'role',
            'avatar', 'bio', 'location', 'phone', 'website',
            'skills', 'experience', 'education', 'linkedin', 'github', 'portfolio',
            'company', 'company_size', 'industry', 'founded',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at', 'is_active']

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return f"{settings.SITE_URL.rstrip('/')}{obj.avatar.url}"
        return None

    def get_resume(self, obj):
        # resume removed
        return None

    def validate_skills(self, value):
        """Ensure skills is a list of strings"""
        if value and not isinstance(value, list):
            raise serializers.ValidationError('Skills must be a list')
        return value

    def validate_phone(self, value):
        """Basic phone validation"""
        if value:
            # Remove common formatting characters for validation
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 7:
                raise serializers.ValidationError('Phone number is too short')
        return value

    def validate_website(self, value):
        """Basic website URL validation"""
        if value and not value.startswith(('http://', 'https://')):
            value = 'https://' + value
        return value

    def validate_linkedin(self, value):
        """Validate LinkedIn URL"""
        if value and 'linkedin.com' not in value.lower():
            raise serializers.ValidationError('Please provide a valid LinkedIn URL')
        return value

    def validate_github(self, value):
        """Validate GitHub URL"""
        if value and 'github.com' not in value.lower():
            raise serializers.ValidationError('Please provide a valid GitHub URL')
        return value


from .models import Job


class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.PrimaryKeyRelatedField(read_only=True)
    posted_by_details = UserSerializer(source='posted_by', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'description',
            'requirements', 'salary', 'type', 'posted_by', 'posted_by_details',
            'posted_at', 'applicant_count'
        ]
        read_only_fields = ['id', 'posted_by', 'posted_at', 'applicant_count']

    def create(self, validated_data):
        # Set the posted_by to the current user
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)


from .models import SavedCandidate


class SavedCandidateSerializer(serializers.ModelSerializer):
    """Serializer for saved candidates with nested candidate details"""
    candidate_details = UserSerializer(source='candidate', read_only=True)
    candidate_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedCandidate
        fields = [
            'id', 'candidate_id', 'candidate_details', 'match_score',
            'notes', 'applied_for', 'saved_at'
        ]
        read_only_fields = ['id', 'saved_at', 'candidate_details']

    def create(self, validated_data):
        candidate_id = validated_data.pop('candidate_id')
        try:
            candidate = User.objects.get(id=candidate_id, role='seeker', is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError({'candidate_id': 'Candidate not found'})
        
        validated_data['candidate'] = candidate
        validated_data['employer'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, data):
        employer = self.context['request'].user
        if employer.role != 'employer':
            raise serializers.ValidationError('Only employers can save candidates')
        
        # Check for duplicate on create
        if self.instance is None:  # Creating new record
            candidate_id = data.get('candidate_id')
            if SavedCandidate.objects.filter(employer=employer, candidate_id=candidate_id).exists():
                raise serializers.ValidationError('Candidate already saved')
        
        return data


from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for job applications"""
    job_id = serializers.IntegerField(write_only=True)
    job_details = JobSerializer(source='job', read_only=True)
    seeker_id = serializers.IntegerField(source='seeker.id', read_only=True)
    seeker_name = serializers.CharField(source='seeker.name', read_only=True)
    seeker_email = serializers.EmailField(source='seeker.email', read_only=True)
    seeker_details = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'job_id', 'job_details', 'seeker_id', 'seeker_name', 'seeker_email',
            'seeker_details', 'status', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'seeker_id', 'seeker_name', 'seeker_email', 'seeker_details', 'applied_at', 'updated_at']

    def get_seeker_details(self, obj):
        return UserSerializer(obj.seeker, context=self.context).data

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            raise serializers.ValidationError({'job_id': 'Job not found'})
        
        validated_data['job'] = job
        validated_data['seeker'] = self.context['request'].user
        
        # Increment applicant count on the job
        job.applicant_count += 1
        job.save()
        
        return super().create(validated_data)

    def validate(self, data):
        user = self.context['request'].user
        if user.role != 'seeker':
            raise serializers.ValidationError('Only job seekers can apply to jobs')
        
        # Check for duplicate application on create
        if self.instance is None:
            job_id = data.get('job_id')
            if Application.objects.filter(job_id=job_id, seeker=user).exists():
                raise serializers.ValidationError('You have already applied to this job')
        
        return data


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating application status (employers only)"""
    class Meta:
        model = Application
        fields = ['status']

    def validate_status(self, value):
        if value not in ['pending', 'reviewed', 'accepted', 'rejected']:
            raise serializers.ValidationError('Invalid status')
        return value


from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages"""
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'sender_name', 'sender_avatar', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender_id', 'sender_name', 'sender_avatar', 'is_read', 'created_at']

    def get_sender_avatar(self, obj):
        if obj.sender.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.sender.avatar.url)
            return f"{settings.SITE_URL.rstrip('/')}{obj.sender.avatar.url}"
        return None


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations with participant details"""
    employer_details = UserSerializer(source='employer', read_only=True)
    seeker_details = UserSerializer(source='seeker', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'employer_details', 'seeker_details', 'participant', 
                  'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content,
                'created_at': last_msg.created_at,
                'sender_id': last_msg.sender.id
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_participant(self, obj):
        """Return the other participant's details based on current user"""
        request = self.context.get('request')
        if request and request.user:
            if request.user.id == obj.employer.id:
                return UserSerializer(obj.seeker, context=self.context).data
            else:
                return UserSerializer(obj.employer, context=self.context).data
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer for conversation with all messages"""
    employer_details = UserSerializer(source='employer', read_only=True)
    seeker_details = UserSerializer(source='seeker', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'employer_details', 'seeker_details', 'participant',
                  'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participant(self, obj):
        """Return the other participant's details based on current user"""
        request = self.context.get('request')
        if request and request.user:
            if request.user.id == obj.employer.id:
                return UserSerializer(obj.seeker, context=self.context).data
            else:
                return UserSerializer(obj.employer, context=self.context).data
        return None


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending a new message"""
    recipient_id = serializers.IntegerField(required=True)
    content = serializers.CharField(required=True, max_length=5000)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty')
        return value.strip()

    def validate_recipient_id(self, value):
        try:
            User.objects.get(id=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError('Recipient not found')
        return value


from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job_id', 'job_details', 'saved_at']
        read_only_fields = ['id', 'saved_at', 'job_details']

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            raise serializers.ValidationError({'job_id': 'Job not found'})

        validated_data['job'] = job
        validated_data['seeker'] = self.context['request'].user
        # Ensure only seekers can save jobs
        if self.context['request'].user.role != 'seeker':
            raise serializers.ValidationError('Only job seekers can save jobs')

        return super().create(validated_data)

    def validate(self, data):
        user = self.context['request'].user
        if user.role != 'seeker':
            raise serializers.ValidationError('Only job seekers can save jobs')
        # On create, prevent duplicates
        if self.instance is None:
            job_id = data.get('job_id')
            if SavedJob.objects.filter(seeker=user, job_id=job_id).exists():
                raise serializers.ValidationError('Job already saved')
        return data

