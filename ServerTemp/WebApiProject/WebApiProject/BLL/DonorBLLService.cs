using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebApiProject.BLL.Interfaces;
using WebApiProject.DAL.Interfaces;
using WebApiProject.Models;
using WebApiProject.Models.DTO;

namespace WebApiProject.BLL
{
    public class DonorBLLService : IDonorBLLService
    {
        private readonly IDonorDAL donorDAL;
        private readonly IMapper mapper;
        private readonly ILogger<DonorBLLService> logger;

        public DonorBLLService(IDonorDAL donorDAL, IMapper mapper, ILogger<DonorBLLService> logger)
        {
            this.donorDAL = donorDAL;
            this.mapper = mapper;
            this.logger = logger;
        }

        public async Task<List<DonorDTO>> Get()
        {
            try
            {
                logger.LogInformation("Fetching all donors");

                var donors = await donorDAL.Get();
                var donorsDto = mapper.Map<List<DonorDTO>>(donors);

                return donorsDto;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching donors");
                throw;
            }
        }

        public async Task<List<DonorDTO>> GetFiltered(DonorFilterDTO filter)
        {
            try
            {
                logger.LogInformation("Fetching donors with filter {@Filter}", filter);

                var query = donorDAL.Query(); // חשיפת IQueryable מה-DAL

                if (!string.IsNullOrEmpty(filter.Name))
                    query = query.Where(d => d.Name.Contains(filter.Name));

                if (!string.IsNullOrEmpty(filter.Email))
                    query = query.Where(d => d.Email.Contains(filter.Email));

                if (!string.IsNullOrEmpty(filter.GiftName))
                    query = query.Where(d => d.Gifts.Any(g => g.Name.Contains(filter.GiftName)));

                var donors = await query.ToListAsync();
                return mapper.Map<List<DonorDTO>>(donors);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching filtered donors");
                throw;

            }
        }
        public async Task<DonorDTO?> GetById(int id)
        {
            try
            {
                logger.LogInformation("Fetching donor with id {Id}", id);

                var donor = await donorDAL.GetById(id);
                return mapper.Map<DonorDTO>(donor);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching donor {Id}", id);
                throw;
            }
        }

        public async Task Add(DonorDTO donorDTO)
        {
            try
            {
                logger.LogInformation("Adding donor with email {Email}", donorDTO.Email);

                var donor = mapper.Map<Donor>(donorDTO);
                await donorDAL.Add(donor);

                logger.LogInformation("Donor added successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while adding donor");
                throw;
            }
        }

        public async Task<bool> Put(int id, DonorDTO donorDTO)
        {
            try
            {
                logger.LogInformation("Updating donor {Id}", id);

                var donor = await donorDAL.GetById(id);
                if (donor == null)
                    return false;

                mapper.Map(donorDTO, donor);
                await donorDAL.Put(donor);

                logger.LogInformation("Donor {Id} updated successfully", id);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating donor {Id}", id);
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            try
            {
                logger.LogInformation("Deleting donor {Id}", id);

                var result = await donorDAL.Delete(id);

                if (!result)
                {
                    logger.LogWarning("Delete failed for donor {Id}: donor not found or has gifts", id);
                }

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting donor {Id}", id);
                throw;
            }
        }
    }

}
