using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Data;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.BLL
{
    public class UserBLLService : IUserBLLService
    {
        private readonly IUserDAL userDal;
        private readonly IMapper mapper;
        private readonly AppDbContext context;
        private readonly ILogger<UserBLLService> logger;

        public UserBLLService(IUserDAL userDal, IMapper mapper, AppDbContext context, ILogger<UserBLLService> logger)
        {
            this.userDal = userDal;
            this.mapper = mapper;
            this.context = context;
            this.logger = logger;
        }

        public async Task<List<User>> Get()
        {
            try
            {
                logger.LogInformation("Fetching all users");
                return await userDal.Get();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching users");
                throw;
            }
        }

        public async Task<User?> GetById(int id)
        {
            try
            {
                logger.LogInformation("Fetching user {Id}", id);
                return await userDal.GetById(id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching user {Id}", id);
                throw;
            }
        }

        public async Task Add(UserDTO userDTO)
        {
            try
            {
                logger.LogInformation("Adding user with email {Email}", userDTO.Email);

                if (await userDal.EmailExists(userDTO.Email))
                {
                    logger.LogWarning("Email already exists: {Email}", userDTO.Email);
                    throw new InvalidOperationException("Email already exists");
                }

                var user = mapper.Map<User>(userDTO);
                user.Role = RoleEnum.User;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDTO.Password);

                await userDal.Add(user);

                logger.LogInformation("User added successfully");
            }
            catch (InvalidOperationException)
            {
                throw; // הודעה למשתמש
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while adding user");
                throw;
            }
        }

        public async Task<bool> Put(int id, UserDTO userDTO)
        {
            try
            {
                logger.LogInformation("Updating user {Id}", id);

                var user = await userDal.GetById(id);
                if (user == null)
                    return false;

                mapper.Map(userDTO, user);
                await userDal.Put(user);

                logger.LogInformation("User {Id} updated successfully", id);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating user {Id}", id);
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            try
            {
                logger.LogInformation("Deleting user {Id}", id);
                return await userDal.Delete(id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting user {Id}", id);
                throw;
            }
        }

        public async Task<User?> ValidateUser(string email, string password)
        {
            try
            {
                logger.LogInformation("Validating user login for {Email}", email);

                var user = await context.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null || string.IsNullOrEmpty(user.PasswordHash))
                    return null;

                bool passwordOk = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                return passwordOk ? user : null;
            }
            catch (BCrypt.Net.SaltParseException ex)
            {
                logger.LogError(ex, "Invalid password hash for {Email}", email);
                return null;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during login for {Email}", email);
                throw;
            }
        }

    }
}