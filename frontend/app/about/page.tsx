import { Navbar } from "@/components/ui/navbar"
import { Card, CardContent } from "@/components/ui/card"

type Award = {
  number: number
  title: string
  description: string
  recipients?: string
  requirement?: string
}


const awards: Award[] = [
  {
    number: 1,
    title: "Science and Technology Academy Award",
    description: "The award is conferred biennially to a Nepali scientist/technologist who has made outstanding contributions to the field of science and technology through significant inventions or scientific discoveries. The award carries an amount of NPR 200,000."
  },
  {
    number: 2,
    title: "Nature Conservation Award",
    description: "The award is conferred every two years to a Nepali scientist/technologist/organization in recognition of outstanding and exceptional contribution to forest conservation, flora, soil and land structuring, natural resources, and environment of Nepal. The award includes a cash amount of NPR 200,000."
  },
  {
    number: 3,
    title: "Chancellor National Innovation Award",
    description: "The award is conferred annually to a Nepali scientist/technologist/organization for outstanding contributions in the field of science, technology, and innovation. The award includes a cash amount of NPR 200,000."
  },
  {
    number: 4,
    title: "Science Award",
    description: "The award is conferred annually to a Nepali scientist/technologist in recognition of outstanding contributions to the field of science through publications, scientific research, and inventions. Candidates must be above 40 years of age as of the application deadline. The award carries the amount of NPR 100,000.",
  },
  {
    number: 5,
    title: "Technology Award",
    description: "The award is conferred annually to a Nepali scientist/technologist in recognition of notable contributions to the field of technology, based on their publications, research, innovation and inventions. Candidates must be above 40 years of age as of the application deadline. The award includes a amount of NPR 100,000.",
  },
  {
    number: 6,
    title: "Science and Technology Youth Award",
    description: "The award is conferred annually to five talented Nepali youths in recognition of notable contributions to the field of science and technology. Candidates must not exceed 40 years of age at the time of submission. Each award carries amount of NPR 75,000."
  },
  {
    number: 7,
    title: "Women in Science and Technology Award",
    description: "The award is conferred annually to a Nepali woman scientist/technologist in recognition of significant contributions to the field of science and technology. The award includes amount of NPR 75,000."
  },
  {
    number: 8,
    title: "Science and Technology Promotion Award",
    description: "The award is conferred annually to two recipients/organizations for the contributions to the promotion, popularization and application of science and technology through programs and activities that have positive impacts on societal welfare and economic development. Each award includes amount of NPR 50,000."
  },
  {
    number: 9,
    title: "Science and Technology Journalism Award",
    description: "The award is conferred annually to one journalist or media in recognition of their work in promoting and popularizing science and technology through scientific articles, audio/visual or other means, published till the submission deadline. Preference will be accorded to the candidates with formal education in science or have been actively engaged in science journalism. The award carries amount of NPR 50,000."
  },
   {
    number: 10,
    title: "Non-Resident Nepali Science and Technology Award",
    description: "The award is conferred annually to a non-resident Nepali in recognition of significant contributions to science and technology, making measurable economic growth and positive impact on society. The award includes amount of NPR 100,000."
  },

  {
    number: 11,
    title: "Dayananda Bajracharya Research Award",
    description: "The award is awarded annually to two postgraduate students (one male and one female) in recognition of outstanding research thesis in the fields of environmental science, botany, microbiology, geology, biodiversity or biotechnology. Recipients are selected based on their research thesis and related publications. Each award carries amount of NPR 25,000.",
  },
  {
    number: 12,
    title: "Phanindra Prasad Nyaupane Research Award",
    description: "The award is conferred annually to an individual in recognition of outstanding research thesis in the field of plant science under agriculture sciences from a Nepali university.The award is granted based on the evaluation of the research thesis and related publications. The award carries amount of NPR 50,000."
  },
  {
    number: 13,
    title: "Mohan Dhwaj Basnet Technology Academy Award",
    description: "The award is conferred every two years to a researcher/institution in recognition of outstanding contributions in the field of energy source, its conservation, utilization and development. The award includes amount of NPR 25,000."
  },
  {
    number: 14,
    title: "Bhuvaneshwor Technology Award",
    description: "The award is conferred biennially to an individual/institution in recognition of contributions to the development of cost-effective construction technologies and/or the applications of such technologies.The award includes amount of NPR 25,000."
  },
  {
    number: 15,
    title: "Jit Bahadur Nakarmi Metal Technology Award",
    description: "The award is conferred every two years to an individual/institution in recognition of significant contributions to the development and applications of technologies for metal-based machinery, equipment and products."
  },
  {
    number: 16,
    title: "Kaji–Indra Kutuwal Agriculture Award",
    description: "The award is presented every two years in recognition of outstanding contributions to the field of agricultural science, selected on the basis of their related publications and research for agricultural development. The award includes amountof NPR 100,000."
  },
 
  {
    number: 17,
    title: "Hama Balkrishna Shrestha Engineering Award",
    description: "The award is conferred annually to two engineers in recognition of outstanding contributions to the field of civil and structural engineering. The award is granted based on their publications, contributions for economic development and positive societal impacts. The award carries total amount of NPR 200,000 (1 lakh each)."
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 space-y-8">

          {/* Header */}
          <div className="space-y-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-primary">
              NAST Awards
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Recognizing excellence in science, technology, and innovation in Nepal
            </p>
          </div>

          {/* Awards List */}
          <div className="space-y-6">
            {awards.map((award) => (
              <Card
                key={award.number}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">

                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {award.number}
                    </div>

                    <div className="flex-1 space-y-3">
                      <h2 className="text-2xl font-semibold text-primary">
                        {award.title}
                      </h2>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {award.recipients && (
                          <span className="font-medium">
                            Recipients: {award.recipients}
                          </span>
                        )}
                        {award.requirement && (
                          <span className="font-medium text-amber-600">
                            Requirement: {award.requirement}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        {award.description}
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </main>

      <footer className="bg-slate-950 text-slate-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Nepal Academy of Science & Technology. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
