from rest_framework import serializers
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
    avatar = serializers.ImageField(required=False, allow_null=True)

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

