using System;
using System.Collections.Generic;
using System.Text;

namespace HR.Infrastructure.Configurations
{
    public class MongoSettings
    {
        public const string SectionName = "MongoSettings";

        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
    }
}
