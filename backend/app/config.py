from enum import Enum
from typing import List
from pydantic_settings import BaseSettings


class Mode(str, Enum):
    dev = "dev"
    prod = "prod"


class Settings(BaseSettings):
    app_name: str = "your_backend_app"
    """The app name, open to anything"""
    app_domain: str = "localhost:5151"
    """The app domain -> defaults to localhost"""
    mount_point: str = "v1"
    """Mount point for API path"""
    db_name: str = f"{app_name}_backend"
    """db_name to be used to create the app mongo database"""
    db_conn_str: str = "mongodb://localhost:27017/"
    """mongo connection string"""
    allow_new_users: bool = True
    """Allow new users or not"""
    magic_link_enabled: bool = True
    """Magic Link emails enabled"""
    emails_enabled: bool = True
    """If enabled, emails will be sent"""
    emails_from_name: str = "Support"
    """The from email name"""
    emails_from_email: str = ""
    """The from email"""
    smtp_tls: bool = True
    """TLS is enabled by default"""
    smtp_ssl: bool = False
    """SSL is optional"""
    smtp_user: str = "apikey"
    """The SMTP provider user name"""
    smtp_password: str = ""
    """The SMTP provider password"""
    smtp_port: int = 587
    """The SMTP provider port, default is 587"""
    smtp_host: str = "smtp.sendgrid.net"
    """The SMTP host"""

    email_reset_token_expire_minutes: int = 60
    """The email token expiry in minutes, defaults to 60 minutes"""
    refresh_token_expire_minutes: int = 60
    """The reset token expiry in minutes, defaults to 60 minutes"""
    token_expire_minutes: int = 30
    """The token expiry in minutes, defaults to 30 minutes"""
    secret_key: str = "change_me"
    """The key used to hash passwords and psks"""
    authjwt_refresh_key: str = "change_me"
    """The refresh token key"""
    admin_users: str = "ajordanbojanic@gmail.com"
    """The default admin users"""
    user_default_password: str = "change_me"
    """The admin default password"""
    master_psk: str = "change_me"
    """The app master password"""

    google_client_id: str = "change_me"

    class Config:
        env_file = '.env'
        extra = "ignore"

    @property
    def mode(self) -> Mode:
        """
            Returns the application mode based on the database connection string.
            Returns Mode.dev if using localhost, otherwise Mode.prod.
        """
        return Mode.dev if "localhost" in self.db_conn_str else Mode.prod

    @property
    def default_admin_users(self) -> List:
        """
            Returns the default admin users formatted to a list
        """
        return self.admin_users.split('|')

    @property
    def main_app_description(self) -> str:
        return f"""{self.app_name} stater project 🤯"""


settings = Settings()

