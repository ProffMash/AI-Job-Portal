from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action

from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterView(APIView):
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
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                # Ensure user has a token and return it
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'name': user.name,
                    'role': user.role,
                    'avatar': user.avatar.url if user.avatar else None,
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
